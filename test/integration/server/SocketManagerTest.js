/* eslint-disable */
import SocketManager from '../../../src/server/SocketManager.js';
import Client from '../../../src/client/Client.js';
import SocketBridge from '../../util/SocketBridge.js';
import {strict as assert} from 'assert';

function getSocketPair(manager = new SocketManager()) {
    const [clientSocket, serverSocket] = SocketBridge.getSocketPair();
    const client = new Client('aaa');
    client.setSocket(clientSocket);
    const server = manager.socketConnected(serverSocket);
    clientSocket.connect();
    serverSocket.connect();
    return [client, server, manager];
}

describe('Socket Manager Unit', () => {
    describe('Channel Create', () => {
        it('rejects invalid channel type', async () => {
            const [client] = getSocketPair();
            const [channel, response] = await client.requestNewChannel('dog');
            assert.equal(null, channel);
            assert.equal(false, response.success);
            assert.equal(undefined, response.channelName);
        });
        it('accepts valid channel type', async () => {
            const [client] = getSocketPair();
            const [channel, response] = await client.requestNewChannel('game');
            assert.notEqual(null, channel);
            assert.equal(true, response.success);
            assert(response.channelName, 'No channel name returned');
            assert.equal(true, response.channelName.length > 1);
        });
        it('creator can join channel without logging in', async () => {
            const [client] = getSocketPair();
            const [channel] = await client.requestNewChannel('game');
            const response = await channel.join();
            assert.equal(response.success, true);
        });
    });
    describe('Channel Login', () => {
        it('cannot login to non-existing channel', async () => {
            const [client] = getSocketPair();
            const channel = client.getChannel('game:abc', 'abc');
            const response = await channel.request('channel:login', {password: ''});
            assert.equal(false, response.success);
            assert.equal('Invalid channel.', response.message);
        });
        it('password must be correct', async () => {
            let response, channelA;
            const correctPassword = 'AaA';
            const wrongPassword = 'aaa';
            const manager = new SocketManager()
            const [clientA] = getSocketPair(manager);
            [channelA, response] = await clientA.requestNewChannel('game', correctPassword);
            const [clientB] = getSocketPair(manager);
            const channelB = clientB.getChannel(response.channelKey, channelA.name);

            response = await channelB.login(wrongPassword);
            assert.equal(false, response.success);
            const wrongPasswordMessage = response.message;
            response = await channelB.login(wrongPassword + 'a');
            assert.equal(false, response.success);
            assert.equal(wrongPasswordMessage, response.message);
            response = await channelB.login(correctPassword + 'a');
            assert.equal(false, response.success);
            assert.equal(wrongPasswordMessage, response.message);

            response = await channelB.login(correctPassword);
            assert.equal(true, response.success);
            assert.notEqual(wrongPasswordMessage, response.message);
        });
        it('password must be correct', async () => {
            let response, channelA;
            const manager = new SocketManager()
            const [clientA] = getSocketPair(manager);
            [channelA, response] = await clientA.requestNewChannel('game');
            const [clientB] = getSocketPair(manager);
            const channelB = clientB.getChannel(response.channelKey, channelA.name);
            await channelB.login();

            response = await channelB.join();
            assert.equal(true, response.success);
        });
    });
});
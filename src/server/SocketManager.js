import DoodleServer from '../../doodle/DoodleServer.js';
import WebsocketWrapper from 'ws-wrapper';
import Channel from './Channel.js';
import Lobby from '../game/stage/Lobby.js';
import Bidding from '../game/stage/Bidding.js';
import Kitty from '../game/stage/Kitty.js';
import Game from '../game/Game.js';

WebsocketWrapper.MAX_SEND_QUEUE_SIZE = 0;

export default class SocketManager {
    constructor() {
        this.channels = new Map();
    }

    socketConnected(nativeSocket) {
        const socket = new WebsocketWrapper(nativeSocket);

        // events to join and create channels that aren't set on this socket connection yet.
        socket.on('message', (event, data) => {
            data = JSON.parse(data);
            const [eventName, payload] = data.a;
            if (eventName === 'channel:new') {
                const prefix = payload.type ?? null;
                const password = payload.password ?? null;
                const channelName = this.createChannelName(prefix);
                const channel = this.createChannelController(prefix, channelName, password);
                const success = !!channel;
                const response = {success, message: success ? 'Created new channel' : 'Invalid channel prefix.'};
                if (success) {
                    response.channelKey = Channel.createChannelKey(prefix, channelName);
                    response.channelName = channelName;
                }
                socket.emit(eventName, response);
                if (channel) {
                    channel.channelLogin(socket, password);
                }
                return;
            }

            const channelKey = data.c || '';
            if (!channelKey) {
                return;
            }

            const [prefix, channelName] = channelKey.indexOf(Channel.delimiter) > 0 ? channelKey.split(Channel.delimiter) : [null, channelKey];
            const channel = this.channels.get(channelKey);
            if (!channel) {
                const socketChannel = socket.of(Channel.createChannelKey(prefix, channelName));
                socketChannel.emit(eventName, {success: false, message: 'Invalid channel.'});
                return;
            }

            if (eventName === 'channel:login') {
                const password = payload.password ?? null;
                return channel.channelLogin(socket, password);
            }
        });
        return socket;
    }

    createChannelName(prefix) {
        const maxAttempts = 4;
        for (let i = 0; i < maxAttempts; i++) {
            const nameLength = i > 2 ? 5 : 4;
            const channelName = this.constructor.createRandomString(nameLength);
            if (!this.channels.has(Channel.createChannelKey(prefix, channelName))) {
                return channelName;
            }
        }
        throw new Error('Failed to generate unique channel name');
    }

    static createRandomString(length) {
        let result = '';
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < length; i++) {
            result += characters[Math.floor(Math.random() * characters.length)];
        }
        return result;
    }

    createChannel(prefix, channelName, password) {
        const channel = new Channel(prefix, channelName, password);
        this.channels.set(channel.channelKey, channel);
        return channel;
    }

    createGame(channel) {
        const stages = [
            Lobby,
            Bidding,
            Kitty,
        ];
        new Game(stages, channel);
        return channel;
    }

    createDoodle(channel) {
        new DoodleServer(channel);
        return channel;
    }

    createChannelController(prefix, channelName, password) {
        if (prefix === 'game') {
            return this.createGame(this.createChannel(prefix, channelName, password));
        }
        if (prefix === 'doodle') {
            return this.createDoodle(this.createChannel(prefix, channelName, password));
        }
        return null;
    }
}
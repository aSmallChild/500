/* eslint-disable no-unused-vars,no-undef */

import SocketManager from '../../../src/server/SocketManager.js';
import Client from '../../../src/client/Client.js';
import SocketStub from '../../stubs/SocketStub.js';
// noinspection ES6UnusedImports
import should from 'should';

const manager = new SocketManager();

function getPair() {
    const [clientSocket, serverSocket] = SocketStub.getSocketPair();
    const client = new Client('aaa');
    client.setSocket(clientSocket);
    const server = manager.socketConnected(serverSocket);
    clientSocket.connect();
    serverSocket.connect();
    return [client, server];
}

describe('Client Manager Unit', function() {
    describe('Request session IDs', function() {
        const [client, server] = getPair();
        it(`has sessionid`, function(done) {
            client.requestSessionId();
            process.nextTick(() => {
                const sessionId = server.get('session_id');
                should(sessionId).is.type('string', 'session_id is missing');
                done();
            });
        });
    });

});


// todo test connecting and taking over an existing connection
// todo test connecting and reviving a dead session

// this.woot(socket, 1); //todo move
// this.woot(this.client, 1);
//
// function wootServer(socket, wootCount) {
//     if (wootCount > 3) {
//         return;
//     }
//     console.log(`starting woot ${wootCount}`);
//     const woot = socket.of('woot');
//     let calls = 0;
//     woot.on('woot1', data => {
//         if (calls > 3) {
//             return;
//         }
//         calls++;
//         console.log(`WOOT ${calls}/${wootCount} GOT: ${JSON.stringify(data)}`);
//         woot.emit('woot2', {cat: 'meow'});
//         woot.removeAllListeners();
//         this.woot(socket, ++wootCount);
//     });
// }
// function wootClient(socket, wootCount) {
//     if (wootCount > 3) {
//         return;
//     }
//     console.log(`starting woot ${wootCount}`);
//     const woot = socket.of('woot');
//     let calls = 0;
//     woot.on('woot2', data => {
//         if (calls > 3) {
//             return;
//         }
//         calls++;
//         console.log(`WOOT ${calls}/${wootCount} GOT: ${JSON.stringify(data)}`);
//         woot.removeAllListeners();
//         this.woot(socket, ++wootCount);
//     });
//     woot.emit('woot1', {dog: 'woof'});
// }
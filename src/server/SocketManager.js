import DoodleServer from '../../doodle/DoodleServer.js';
import WebsocketWrapper from 'ws-wrapper';

WebsocketWrapper.MAX_SEND_QUEUE_SIZE = 0;

export default class SocketManager {
    constructor() {
        this.doodleServer = null;
        this.games = new Map();
    }

    socketConnected(nativeSocket) {
        const socket = new WebsocketWrapper(nativeSocket);
        socket.on('message', (event, data) => {
            data = JSON.parse(data);
            const channelName = data.c || '';
            const eventName = data.a[0];
            if (!channelName) {
                return;
            }

            if (channelName === 'game') {
                // todo
                return;
            }

            if (channelName === 'doodle') {
                if (eventName === 'join') {
                    const server = this.getDoodle();
                    server.socketConnected(socket);
                }
            }
        });
        return socket;
    }

    getDoodle() {
        if (!this.doodleServer) {
            this.doodleServer = new DoodleServer();
        }
        return this.doodleServer;
    }

    // getGame(name) {
    //     //todo
    // }
}
import WebsocketWrapper from 'ws-wrapper';
import {v4 as uuidv4} from 'uuid';

export default class ClientManager {
    constructor() {
        this.sessions = new Map();
        this.deadSessions = new Map();
    }

    socketConnected(nativeSocket) {
        const socket = new WebsocketWrapper(nativeSocket);
        this._bindClientEvents(socket);
        this._syncSessionId(socket, nativeSocket);
    }

    _bindClientEvents(socket) {
        socket.on('close', () => {
            const sessionId = socket.get('session_id');
            if (!sessionId) {
                return;
            }
            console.log(`ENDING SESSION ${sessionId}`);
            this.sessions.delete(sessionId);
            this.deadSessions.set(sessionId, socket);
        });

        this.woot(socket, 1);
    }

    woot(socket, wootCount) {
        if (wootCount > 3) {
            return;
        }
        console.log(`starting woot ${wootCount}`);
        const woot = socket.of('woot');
        let calls = 0;
        woot.on('woot1', data => {
            if (calls > 3) {
                return;
            }
            calls++;
            console.log(`WOOT ${calls}/${wootCount} GOT: ${JSON.stringify(data)}`);
            woot.emit('woot2', {cat: 'meow'});
            woot.removeAllListeners();
            this.woot(socket, ++wootCount);
        });
    }

    _syncSessionId(socket, nativeSocket) {
        const startSession = sessionId => {
            console.log(`STARTING SESSION: ${sessionId}`);
            let existingSocket = this.sessions.get(sessionId);
            if (existingSocket) {
                existingSocket.emit('disconnecting');
                existingSocket.disconnect();
                existingSocket.bind(nativeSocket);
                socket = existingSocket;
            }

            if (!existingSocket) {
                existingSocket = this.deadSessions.get(sessionId);
                this.deadSessions.delete(sessionId);
                if (existingSocket) {
                    existingSocket.bind(nativeSocket);
                    socket = existingSocket;
                }
            }

            socket.set('session_id', sessionId);
            this.sessions.set(sessionId, socket);
            socket.of('session').emit('session_id', socket.get('session_id'));
        };

        socket.of('session').on('session_id', sessionId => {
            if (socket.get('session_id')) {
                return;
            }
            startSession(sessionId);
        });

        socket.of('session').on('request_session_id', () => {
            if (socket.get('session_id')) {
                socket.of('session').emit('session_id', socket.get('session_id'));
                return;
            }
            startSession(uuidv4());
        });
    }
}
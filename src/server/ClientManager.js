import DoodleServer from '../../doodle/DoodleServer.js';
import WebsocketWrapper from 'ws-wrapper';
import {v4 as uuidv4} from 'uuid';

export default class ClientManager {
    constructor() {
        this.sessions = new Map();
        this.deadSessions = new Map();
        this.doodleServer = new DoodleServer();
    }

    socketConnected(nativeSocket) {
        const socket = new WebsocketWrapper(nativeSocket);
        this._bindClientEvents(socket);
        this._syncSessionId(socket, nativeSocket);
        this.doodleServer.socketConnected(socket);
        return socket;
    }

    _bindClientEvents(socket) {
        socket.on('close', () => {
            const sessionId = socket.get('session_id');
            if (!sessionId) {
                return;
            }
            this.sessions.delete(sessionId);
            this.deadSessions.set(sessionId, socket);
        });
    }

    _syncSessionId(socket, nativeSocket) {
        socket.of('session').on('session_id', sessionId => {
            if (socket.get('session_id')) {
                return;
            }
            this.startSession(socket, nativeSocket, sessionId);
        });

        socket.of('session').on('request_session_id', () => {
            if (socket.get('session_id')) {
                socket.of('session').emit('session_id', socket.get('session_id'));
                return;
            }
            this.startSession(socket, nativeSocket, uuidv4());
        });
    }

    startSession(socket, nativeSocket, sessionId) {
        let previousSocket = this.disconnectSession(sessionId, nativeSocket);
        if (!previousSocket) {
            previousSocket = this.reviveDeadSession(sessionId, nativeSocket);
        }
        if (previousSocket) {
            socket.removeAllListeners();
            socket = previousSocket;
        }

        socket.set('session_id', sessionId);
        this.sessions.set(sessionId, socket);
        socket.of('session').emit('session_id', sessionId);
        // todo this needs to emit some kind of connect event so that things
        //      running on the server know that the socket has connected/reconnected
    }

    disconnectSession(sessionId, nativeSocket) {
        const existingSocket = this.sessions.get(sessionId);
        if (!existingSocket) {
            return null;
        }
        console.log(`Disconnecting previous socket: ${sessionId}`);
        // existingSocket.emit('disconnecting');
        existingSocket.disconnect();
        existingSocket.bind(nativeSocket);
        return existingSocket;
    }

    reviveDeadSession(sessionId, nativeSocket) {
        const deadSocket = this.deadSessions.get(sessionId);
        if (!deadSocket) {
            return null;
        }
        this.deadSessions.delete(sessionId);
        deadSocket.bind(nativeSocket);
        return deadSocket;
    }
}
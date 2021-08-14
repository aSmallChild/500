import WebsocketWrapper from 'ws-wrapper';

export default class Client {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this._sessionId = null;
    }

    set sessionId(sessionId) {
        // todo set cookie
        console.log(`GOT SESSIONID: ${sessionId}`);
        this._sessionId = sessionId;
    }

    get sessionId() {
        // todo get cookie
        // if (!this._sessionId && !this._cookieChecked) {
        //     this._cookieChecked = true
        //     // get cookie?
        // }
        return this._sessionId;
    }

    connect() {
        if (this.socket) {
            return;
        }
        const newSocket = new WebSocket(this.url);
        if (this.oldSocket) {
            this.oldSocket.bind(newSocket);
            this.socket = this.oldSocket;
            this.oldSocket = null;
            return;
        }

        this.socket = new WebsocketWrapper(newSocket);
        this._bindClientEvents();
        this._syncSessionId();
    }

    of(...args) {
        this.connect();
        return this.socket.of(...args);
    }

    _bindClientEvents() {
        this.socket.on('close', () => {
            console.log('DISCONNECTED');
            this.oldSocket = this.socket;
            this.socket = null;
        });
    }

    _syncSessionId() {
        const sessionChannel = this.socket.of('session');
        sessionChannel.on('session_id', sessionId => this.sessionId = sessionId);
        if (!this.sessionId) {
            sessionChannel.emit('request_session_id');
            return;
        }
        sessionChannel.emit('session_id', this.sessionId);
    }
}
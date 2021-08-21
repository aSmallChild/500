import WebsocketWrapper from 'ws-wrapper';

export default class Client {
    constructor(url) {
        this.url = url;
        this.socket = null;
    }

    connect() {
        if (this.socket) {
            return;
        }

        const newSocket = new WebSocket(this.url);
        if (!this.oldSocket) {
            this.setSocket(newSocket);
            return;
        }

        this.oldSocket.bind(newSocket);
        this.socket = this.oldSocket;
        this.oldSocket = null;
    }

    setSocket(socket) {
        this.socket = new WebsocketWrapper(socket);
        this._bindClientEvents();
    }

    of(...args) {
        this.connect();
        const channel = this.socket.of(...args); // todo emit join channel, check if the channels are cached (I think they are)
        channel.emit('join');
        return channel;
    }

    _bindClientEvents() {
        this.socket.on('close', () => {
            console.log('DISCONNECTED');
            this.oldSocket = this.socket;
            this.socket = null;
        });
    }

    static get client() {
        if (!this._client) {
            this._client = new Client(window.socketURL);
        }
        return this._client;
    }

    static set client(client) {
        this._client = client;
    }
}
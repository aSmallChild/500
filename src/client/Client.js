import WebsocketWrapper from 'ws-wrapper';
import ClientChannel from './ClientChannel.js';

export default class Client {
    constructor(url) {
        // todo set name somehow
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

    of(channelKey) {
        channelKey = channelKey.toLowerCase();
        this.connect();
        const channel = this.socket.of(channelKey);
        channel.removeAllListeners();
        return new ClientChannel(channel);
    }

    _bindClientEvents() {
        this.socket.on('close', () => {
            console.log('DISCONNECTED');
            this.oldSocket = this.socket;
            this.socket = null;
        });
    }

    async requestNewChannel(type, password) {
        const response = await this.request('channel:new', {type, password});
        if (!response.success) {
            return null;
        }
        const channel = this.of(response.channelKey);
        channel.name = response.channelName;
        return channel;
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

    request(topic, payload) {
        this.connect();
        return this.constructor.request(this.socket, topic, payload);
    }

    static request(socket, topic, payload, ttlMs = 10000) {
        return new Promise((win, fail) => {
            const timeout = setTimeout(() => {
                socket.removeAllListeners(topic);
                fail({
                    success: false,
                    message: 'Request timed out.',
                });
            }, ttlMs);
            socket.once(topic, response => {
                clearTimeout(timeout);
                win(response);
            });
            socket.emit(topic, payload);
        });
    }
}
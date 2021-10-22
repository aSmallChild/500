import WebsocketWrapper from 'ws-wrapper';
import ClientChannel from './ClientChannel.js';

export default class Client {
    #channels = new WeakMap();

    constructor(url) {
        this.url = url;
        this.socket = null;
    }

    isConnected() {
        return !!this.socket;
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

    getChannel(channelKey, channelName) {
        channelKey = channelKey.toLowerCase();
        this.connect();

        const channel = this.socket.of(channelKey);
        let clientChannel = this.#channels.get(channel);
        if (clientChannel) {
            return clientChannel;
        }

        channel.removeAllListeners();
        clientChannel = new ClientChannel(channel, channelName);
        this.#channels.set(channel, clientChannel);
        clientChannel.onLeave(() => this.#channels.delete(channel));
        return clientChannel;
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
            return [null, response];
        }
        const channel = this.getChannel(response.channelKey, response.channelName);
        return [channel, response];
    }

    static get client() {
        if (!this._client) {
            const url = new URL(window.location);
            const protocol = url.protocol === 'http:' ? 'ws:' : 'wss:';
            const host = process.env.VUE_APP_SOCKET_HOST;
            const socketURL = protocol + '//' + (host || url.host);
            this._client = new Client(socketURL);
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
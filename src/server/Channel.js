import ChannelClient from './ChannelClient.js';

export default class Channel {
    static delimiter = ':';

    #onObserver = null;
    #onClient = null;

    constructor(prefix, name, password) {
        this.prefix = prefix;
        this.name = name;
        this.password = password;
        this.clients = new Map();
        this.observers = new Set();
    }

    static createChannelKey(prefix, name) {
        name = name.toLowerCase();
        if (prefix) {
            return `${prefix}${this.delimiter}${name}`
        }
        return name;
    }

    get channelKey() {
        return this.constructor.createChannelKey(this.prefix, this.name);
    }

    static isNameValid(name) {
        return name.indexOf(this.delimiter) >= 0;
    }

    checkPassword(submittedPassword) {
        if (!this.password) {
            return true;
        }
        return this.password === submittedPassword;
    }

    channelLogin(socket, password) {
        if (!this.checkPassword(password)) {
            return false;
        }
        const socketChannel = socket.of(this.channelKey);
        this.observers.add(socketChannel);
        socket.on('disconnect', () => this.observers.delete(socketChannel));

        socketChannel.on('client:login', data => {
            const client = this.clientLogin(data.name, data.password);
            this.sendClientLoginResponse(client, socket, socketChannel);
        });

        if (this.#onObserver) {
            this.#onObserver(socketChannel);
        }
        return true;
    }

    clientLogin(name, password) {
        if (!this.isNameValid(name)) {
            return null;
        }

        const key = name.toLowerCase();
        if (this.clients.has(key)) {
            const client = this.clients.get(key);
            return client.checkPassword(password) ? client : null;
        }

        const client = new ChannelClient(name, password);
        this.clients.set(client.id, client);
        return client;
    }

    sendClientLoginResponse(client, socket, socketChannel) {
        const response = {
            success: false,
        };
        if (client) {
            response.success = true;
            client.add(socketChannel);
            socket.on('disconnect', client.remove(socketChannel));
            if (this.#onClient) {
                this.#onClient(client, socketChannel);
            }
        }
        socketChannel.emit('client:login', response);
    }

    getClient(id) {
        return this.clients.get(id);
    }

    emit(...args) {
        for (const observer of this.observers) {
            try {
                observer.emit(...args);
            } catch (e) {
                this.observers.delete(observer);
            }
        }
    }

    // should be used to let observers know the initial state
    // callback(observer)
    // observer.emit(...)
    onObserver(callback) {
        this.#onObserver = callback;
    }

    // callback(client, channel)
    // client.emit(...), channel.on(...)
    // the channel is the socket that just connected (use this to receive messages)
    // the client is the collection the socket belongs to (use this to send messages)
    onClient(callback) {
        this.#onClient = callback;
    }
}
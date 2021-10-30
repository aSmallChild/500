import ChannelClient from './ChannelClient.js';

export default class Channel {
    static delimiter = ':';

    #onObserver = null;
    #onObserverDisconnect = null;
    #onClient = null;

    constructor(prefix, name, password) {
        this.prefix = prefix;
        this.name = name;
        this.password = password;
        this.clients = new Map();
        this.clientChannels = new WeakMap();
        this.observers = new Set();
    }

    static createChannelKey(prefix, name) {
        name = name.toLowerCase();
        if (prefix) {
            return `${prefix}${this.delimiter}${name}`;
        }
        return name;
    }

    get channelKey() {
        return this.constructor.createChannelKey(this.prefix, this.name);
    }

    isNameValid(name) {
        return name.indexOf(this.delimiter) < 0;
    }

    checkPassword(submittedPassword) {
        if (!this.password) {
            return true;
        }
        return this.password === submittedPassword;
    }

    channelLogin(socket, password) {
        const socketChannel = socket.of(this.channelKey);
        if (!this.checkPassword(password)) {
            socketChannel.emit('channel:login', {success: false, message: 'Password incorrect.'});
            return;
        }
        if (this.observers.has(socketChannel)) {
            socketChannel.emit('channel:login', {success: true});
            return;
        }
        this.observers.add(socketChannel);

        socket.once('disconnect', () => this.observerDisconnect(socketChannel));
        socketChannel.on('client:login', data => {
            try {
                const client = this.clientLogin(data.name, data.password);
                this.sendClientLoginResponse(client, socket, socketChannel);
            } catch (e) {
                console.error(e);
            }
        });

        socketChannel.on('channel:join', () => {
            socketChannel.emit('channel:join', {success: true});
            if (this.#onObserver) {
                this.#onObserver(socketChannel);
            }
            const client = this.clientChannels.get(socketChannel);
            if (client && this.#onClient) {
                this.#onClient(client, socketChannel);
            }
        });
        socketChannel.once('channel:leave', () => this.observerDisconnect(socketChannel));

        socketChannel.emit('channel:login', {success: true});
    }

    disconnectClient(client, code = 4000, reason = 'disconnect') {
        this.clients.delete(client.id);
        client.sockets.forEach(socketChannel => this.observers.delete(socketChannel));
        client.disconnect(code, reason);
    }

    observerDisconnect(socketChannel) {
        if (!this.observers.delete(socketChannel)) {
            return;
        }
        socketChannel.removeAllListeners();
        const client = this.clientChannels.get(socketChannel);
        if (client) {
            client.remove(socketChannel);
        }
        if (this.#onObserverDisconnect) {
            this.#onObserverDisconnect(socketChannel, client);
        }
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
            response.clientId = client.id;
            client.add(socketChannel);
            this.clientChannels.set(socketChannel, client);
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
                this.observerDisconnect(observer);
            }
        }
    }

    // should be used to let observers know the initial state
    // callback(observer)
    // observer.emit(...)
    onObserver(callback) {
        this.#onObserver = callback;
    }

    // callback(socketChannel, client), all event listeners on the channel are removed prior
    onObserverDisconnect(callback) {
        this.#onObserverDisconnect = callback;
    }

    // callback(client, channel)
    // client.emit(...), channel.on(...)
    // the channel is the socket that just connected (use this to receive messages)
    // the client is the collection the socket belongs to (use this to send messages)
    onClient(callback) {
        this.#onClient = callback;
    }
}
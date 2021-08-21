import ChannelClient from './ChannelClient.js';

export default class Channel {
    static delimiter = ':';

    constructor(prefix, name, password) {
        this.prefix = prefix;
        this.name = name;
        this.password = password;
        this.clients = new Map();
        this.observers = new Set();
    }

    get id() {
        return this.name.toLowerCase();
    }

    get channelKey() {
        return this.prefix + this.delimiter + this.id;
    }

    getClientChannelName(client) {
        return this.channelKey + this.delimiter + client.id;
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

    join(socket, password) {
        if (!this.checkPassword(password)) {
            return false;
        }
        const socketChannel = socket.of(this.channelKey);
        this.observers.add(socketChannel);
        socket.on('disconnect', this.observers.delete(socketChannel));

        socketChannel.on('client_login', data => {
            const client = this.findOrCreateClient(data.name, data.password);
            this.sendClientLoginResponse(client, socket, socketChannel);
        });

        if (this._onNewObserver) {
            this._onNewObserver(socketChannel);
        }
        return true;
    }

    findOrCreateClient(name, password) {
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
            channel: '',
        };
        if (client) {
            const clientChannelName = this.getClientChannelName(client);
            const clientChannel = socket.of(clientChannelName);
            response.channel = clientChannelName;
            response.success = true;
            client.addSocket(socket, clientChannel);
            if (this._onClientConnected) {
                this._onClientConnected(client, clientChannel);
            }
        }
        socketChannel.emit('client_login', response);
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
    onNewObserver(callback) {
        this._onNewObserver = callback;
    }

    // callback(client, channel)
    // client.emit(...), channel.on(...)
    // the channel is the socket that just connected (use this to receive messages)
    // the client is the collection the socket belongs to (use this to send messages)
    onNewClient(callback) {
        this._onNewClient = callback;
    }
}
import Client from './Client.js';

export default class ClientChannel {
    #onLeave = null;

    constructor(channel, channelName) {
        this.channel = channel;
        this.name = channelName;
    }

    login(password) {
        return this.request('channel:login', {password});
    }

    clientLogin(name, password) {
        return this.request('client:login', {name, password});
    }

    join() {
        return this.request('channel:join');
    }

    leave() {
        this.channel.emit('channel:leave');
        this.channel.removeAllListeners();
        this.channel = null;
        this.name = null;
        if (this.#onLeave) {
            this.#onLeave();
        }
        this.#onLeave = null;
    }

    onLeave(callback) {
        this.#onLeave = callback;
    }

    on(...args) {
        this.channel.on(...args);
    }

    once(...args) {
        this.channel.once(...args);
    }

    emit(...args) {
        this.channel.emit(...args);
    }

    request(topic, payload) {
        return Client.request(this.channel, topic, payload);
    }

    static getCredentials() {
        const json = window.localStorage.getItem('last_game_credentials');
        return json ? JSON.parse(json) : null;
    }

    static setCredentials(credentials) {
        return window.localStorage.setItem('last_game_credentials', JSON.stringify(credentials));
    }

    static async reconnect(channelKey) {
        const credentials = this.getCredentials();
        if (!credentials || credentials.channelKey !== channelKey) {
            return [null, {success: false, message: 'Cannot reconnect, channel key does not match stored credentials.'}];
        }
        const client = Client.client;
        const channel = client.getChannel(channelKey, credentials.channelName);

        const response = await channel.login(credentials.channelPassword);
        if (!response.success) {
            return [null, response];
        }

        const clientLoginResponse = await this.channelClientLogin(channel, credentials.clientName, credentials.clientPassword);
        if (clientLoginResponse && !clientLoginResponse.success) {
            return [null, clientLoginResponse];
        }

        return [channel, response];
    }

    static async connect(channelKey, channelName, channelPassword, clientName, clientPassword) {
        const client = Client.client;
        const channel = client.getChannel(channelKey, channelName);

        const response = await channel.login(channelPassword);
        if (!response.success) {
            return [null, response];
        }

        const clientLoginResponse = await this.channelClientLogin(channel, clientName, clientPassword);
        if (clientLoginResponse && !clientLoginResponse.success) {
            return [null, clientLoginResponse];
        }

        this.setCredentials({channelKey, channelName, channelPassword, clientName, clientPassword});
        return [channel, response];
    }

    static async create(type, channelPassword, clientName, clientPassword) {
        const client = Client.client;
        const [channel, response] = await client.requestNewChannel(type, channelPassword);
        if (!response.success) {
            return [null, response];
        }
        const {channelKey, channelName} = response;
        const clientLoginResponse = await this.channelClientLogin(channel, clientName, clientPassword);
        if (clientLoginResponse && !clientLoginResponse.success) {
            return [null, clientLoginResponse];
        }

        this.setCredentials({channelKey, channelName, channelPassword, clientName, clientPassword});
        return [channel, response];
    }

    static async channelClientLogin(channel, clientName, clientPassword) {
        channel.clientId = null;
        if (!clientName) {
            return null;
        }

        const response = await channel.clientLogin(clientName, clientPassword);
        if (response.success) {
            channel.clientId = response.clientId;
        }

        return response;
    }
}
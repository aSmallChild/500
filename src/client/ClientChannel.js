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

    emit(...args) {
        this.channel.emit(...args);
    }

    request(topic, payload) {
        return Client.request(this.channel, topic, payload);
    }
}
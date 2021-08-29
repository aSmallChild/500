import Client from './Client.js';

export default class ClientChannel {
    constructor(channel) {
        this.channel = channel;
        this.name = '';
    }

    join(password) {
        return Client.request(this.channel, 'channel:join', {password});
    }

    leave() {
        this.channel.emit('channel:leave');
        this.channel.removeAllListeners();
    }

    on(...args) {
        this.channel.on(...args);
    }

    emit(...args) {
        this.channel.emit(...args);
    }
}
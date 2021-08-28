export default class ClientChannel {
    constructor(channel) {
        this.channel = channel;
    }

    join(password) {
        return new Promise((win, fail) => {
            const timeout = setTimeout(() => {
                this.channel.removeAllListeners('channel:join');
                fail({
                    success: false,
                    error: 'Channel login timed out.',
                });
            }, 10000);
            this.channel.once('channel:join', response => {
                clearTimeout(timeout);
                win(response);
            });
            this.channel.emit('channel:join', {password});
        });
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
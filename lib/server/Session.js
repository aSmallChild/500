const sessionHealthCheckIntervalMs = 60000;

export default class Session {
    #quit = false;
    #onMessage;
    #onClose = [];

    constructor(socket) {
        this.socket = socket;
        this.lastMessageTime = Date.now();
        this.messageCheckInterval = setInterval(() => {
            if (Date.now() - this.lastMessageTime > sessionHealthCheckIntervalMs) {
                this.ping();
            }
        }, sessionHealthCheckIntervalMs);

        socket.addEventListener('message', message => {
            try {
                if (this.quit) {
                    socket.close(1011, 'WebSocket broken.');
                    return;
                }
                this.lastMessageTime = Date.now();
                const [event, data] = JSON.parse(message.data);
                if (event == 'ping') {
                    const now = Date.now();
                    this.emit('pong', {then: data, now, diff: now - data});
                    return;
                }

                if (this.#onMessage) this.#onMessage(event, data);
            } catch (err) {
                console.error('error while handling socket message', err.message, err.stack);
            }
        });

        socket.addEventListener('close', () => this.#handleClose());
        socket.addEventListener('error', () => this.#handleClose());
    }

    get quit() {
        return this.#quit;
    }

    onClose(callback) {
        this.#onClose.push(callback);
    }

    onMessage(callback) {
        this.#onMessage = callback;
    }

    ping() {
        this.emit('ping', Date.now());
    }

    emit(event, data) {
        this.send([event, data]);
    }

    send(data) {
        try {
            if (this.quit) return;
            if (typeof data !== 'string') data = JSON.stringify(data);
            this.socket.send(data);
            this.lastMessageTime = Date.now();
        } catch (err) {
            console.error('failed to send message to socket');
            console.error(err.message);
            this.#handleClose();
        }
    }

    #handleClose() {
        try {
            if (this.quit) return;
            clearInterval(this.messageCheckInterval);
            this.#quit = true;
            this.#onClose.forEach(cb => {
                try {
                    cb();
                } catch (err) {
                    console.error('Error while calling socket onClose handler', err);
                }
            });
        } catch (err) {
            console.error('error while closing socket');
            console.error(err.message);
        }
    }

    close(code, reason) {
        if (this.quit) return;
        this.socket.close(code, reason);
        this.#handleClose();
    }
}
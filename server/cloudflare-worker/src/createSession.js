const sessionHealthCheckIntervalMs = 300000;

export default function createSession() {
    const {0: client, 1: server} = new WebSocketPair();
    server.accept();
    return [new Response(null, {status: 101, webSocket: client}), new Session(server)];
}

class Session {
    #quit = false;
    #onMessage;
    #onClose = [];

    constructor(socket) {
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
                console.error('error while handling socket message');
                console.error(err.message);
            }
        });

        socket.addEventListener('close', () => this.#handleClose());
        socket.addEventListener('error', () => this.#handleClose());
    }

    get quit() {
        return this.#quit;
    }

    set onClose(callback) {
        this.#onClose.push(callback);
    }

    set onMessage(callback) {
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
            socket.send(data);
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

    close() {
        if (this.quit) return;
        this.socket.close();
        this.#handleClose();
    }
}
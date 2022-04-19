export default class WebSocketPair {
    constructor() {
        const a = new Socket(), b = new Socket();
        a.remoteSocket = b;
        b.remoteSocket = a;
        this[0] = a;
        this[1] = b;
    }
}

class Socket {
    constructor() {
        this.listners = new Map();
        this.remoteSocket;
        this.closed = false;
    }

    trigger(event, data) {
        const listener = this.listners.get(event);
        if (listener) listener(data);
    }

    addEventListener(event, listener) {
        this.listners.set(event, listener);
    }

    send(data) {
        if (this.closed) throw new Error('socket closed');
        process.nextTick(() => this.remoteSocket.trigger('message', data));
    }

    close(code = 1000, reason = '') {
        if (this.closed) throw new Error('socket closed');
        const event = {
            code, reason, wasClean: code === 1000,
        };
        this.trigger('close', event);
        this.closed = true;
        process.nextTick(() => {
            this.remoteSocket.trigger('close', event);
            this.remoteSocket.closed = true;
        });

    }
}
export default class ChannelClient {
    constructor(name, password) {
        this.name = name;
        this.password = password;
        this.sockets = new Set();
    }

    get id() {
        return this.name.toLowerCase();
    }

    get connectionCount() {
        return this.sockets ? this.sockets.size : 0;
    }

    checkPassword(submittedPassword) {
        if (!this.password) {
            return true;
        }
        return this.password === submittedPassword;
    }

    add(socketChannel) {
        this.sockets.add(socketChannel);
        socketChannel.once('disconnect', () => this.remove(socketChannel));
    }

    remove(socketChannel) {
        if (!this.sockets) return;
        this.sockets.delete(socketChannel);
    }

    disconnect(...args) {
        this.name = null;
        this.password = null;
        for (const socketChannel of this.sockets) {
            try {
                socketChannel._wrapper.disconnect(...args);
            } catch (e) {
                console.error(e)
            }
        }
        this.sockets.clear();
        this.sockets = null;
    }

    emit(...args) {
        for (const socketChannel of this.sockets) {
            try {
                socketChannel.emit(...args);
            } catch (e) {
                this.sockets.delete(socketChannel);
            }
        }
    }
}
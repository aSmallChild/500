export default class ChannelClient {
    constructor(name, password) {
        this.name = name;
        this.password = password;
        this.sockets = new Set();
    }

    get id() {
        return this.name.toLowerCase();
    }

    checkPassword(submittedPassword) {
        if (!this.password) {
            return true;
        }
        return this.password === submittedPassword;
    }

    addSocket(socket, socketChannel) {
        if (this.sockets.has(socketChannel)) {
            return;
        }
        this.sockets.add(socketChannel);
        socket.on('disconnect', this.sockets.delete(socketChannel));
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
export default class SocketBridge {
    constructor() {
        this.onopen = this.onmessage = this.onerror = this.onclose = null;
        this.remoteSocket = null;
    }

    send(data) {
        process.nextTick(() => {
            const event = {data};
            this.remoteSocket.onmessage(event);
        });
    }

    connect() {
        this.onopen({data: "connected..."});
    }

    static getSocketPair() {
        const client = new this(), server = new this();
        client.remoteSocket = server;
        server.remoteSocket = client;
        return [client, server];
    }
}
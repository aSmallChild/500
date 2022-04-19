import Session from '../../../lib/server/Session.js';

export default function createSession() {
    const {0: client, 1: server} = new WebSocketPair();
    server.accept();
    return [new Response(null, {status: 101, webSocket: client}), new Session(server)];
}
import SocketManager from '../../../lib/server/SocketManager.js';

export default {
    async fetch(request, env) {
        return await handleRequest(request, env);
    },
};

const getLobby = (key, env) => env.LOBBY.get(env.LOBBY.idFromName(key));

function websocketUpgrade() {
    const {0: client, 1: server} = new WebSocketPair();
    server.accept();
    return [new Response(null, {status: 101, webSocket: client}), server];
}

async function handleRequest(request, env) {
    // requests
        // POST /lobby
            // body:
                // lobby: (required)
                    // name: string (required) lobby identifier
                    // type: string (required if lobby doesn't exist, ignored if it does) whether it's a doodle or game
                    // password: string (optional) set on lobby if its being created, checked if the lobby already exists
                // user: (optional)
                    // username|google_id|auth0_id|some_kind_of_id (required)
                    // password (optional) (set if new, check if already exists)
            // response
                // session_id (string) token can be used for the session endpoint to open up a socket connection
                // lobby_id (display only)
                // username (display only, this could be derived from the google_id they login)
                // error

        // socket /lobby/<lobby_id>/<session_id>


        // lobby passes some kind of state persistencey interface with a get and set method for storing stuff in durable objects
        // lobby calls channel.onSession(socket => {...}) whenever someone connects

    const key = 'A';
    return getLobby(key, env).fetch(request);
}

export class Lobby {
    constructor(state, env) {
        this.state = state;
        this.socketManager = new SocketManager();
    }

    async fetch(request) {
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader) {
            if (upgradeHeader !== 'websocket') {
                return new Response('Expected Upgrade: websocket', {status: 426});
            }

            return this.handleWebsocketUpgrade();
        }

        return new Response('Not found!', {status: 404});
    }

    handleWebsocketUpgrade() {
        const [response, socket] = websocketUpgrade();
        this.socketManager.socketConnected(socket);
        return response;
    }
}

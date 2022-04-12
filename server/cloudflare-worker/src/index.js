import createSession from './createSession.js';

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
        this.taken = false;
        this.sessionCount = 0;
    }

    handleSession(request, session) {
        this.sessionCount++;
        session.onClose = () => this.sessionCount--;
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
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader && upgradeHeader !== 'websocket') {
            return new Response('Expected Upgrade: websocket', {status: 426});
        }
        const [response, session] = createSession();
        this.handleSession(request, session);
        return response;
    }
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        },
    });
}
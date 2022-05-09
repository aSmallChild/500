import {jsonRequest, jsonResponse, getRandomLetters} from './util.js';

import {lobbyTypes} from './Lobby.js';

export {Lobby} from './Lobby.js';

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin');
        if (origin != 'http://localhost:3000' && origin != 'https://legit.nz') {
            return new Response(null, {status: 400});
        }

        const original = await handleRequest(request, env);
        const response = new Response(original.body, original);
        response.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Headers', '*');
        return response;
    },
};

async function handleRequest(request, env) {
    try {
        if (request.method === 'OPTIONS') {
            return new Response(null, {status: 204});
        }
        const requestToForward = request.clone();
        // POST /lobby {lobby, user}
        //  -> DO/lobby_create

        // POST /lobby/lobbyId {lobby, user}
        //  -> DO/user_create

        // GET /lobby/lobbyId/userId
        //  -> DO/session_create/lobbyId/userId

        const url = new URL(request.url);
        const basePath = '/lobby';
        if (url.pathname == basePath) return await createLobby(request, requestToForward, env);

        const [lobbyId, userId] = url.pathname.replace(basePath + '/', '').split('/');
        if (!lobbyId || lobbyId.length > 6) return jsonResponse({message: 'bad lobbyId'}, 400);

        if (lobbyId && userId) return await createSession(request, requestToForward, env, lobbyId, userId);
        if (lobbyId) return await createUser(request, requestToForward, env, lobbyId);
        return jsonResponse({message: 'bad url'}, 404);
    } catch (err) {
        console.error(`Failed to handle request ${request.method} ${request.url}`, err.message, err.stack);
        return jsonResponse({message: 'internal error'}, 500);
    }
}

async function createLobby(request, requestToForward, env) {
    const [json, response] = await jsonRequest(request);
    if (response) return response;

    if (!lobbyTypes.has(json?.lobby?.type)) {
        return jsonResponse({error: 'bad lobby type'}, 400);
    }

    return await findAvailableLobbyAndSetItUp(requestToForward, env);
}

async function createUser(request, requestToForward, env, lobbyId) {
    const response = await jsonRequest(request)[1];
    if (response) return response;
    return getLobby(lobbyId, env).fetch(new Request('https://.../user_create', requestToForward));
}

async function createSession(request, requestToForward, env, lobbyId, userId) {
    if (request.method != 'GET') return jsonResponse({message: 'bad method'}, 405);
    if (!userId) return jsonResponse({message: 'bad userId'}, 400);
    return getLobby(lobbyId, env).fetch(new Request(`https://.../session_create/${userId}`, requestToForward));
}

const getLobby = (key, env) => env.LOBBY.get(env.LOBBY.idFromName(key.toUpperCase()));

async function findAvailableLobbyAndSetItUp(request, env) {
    let response;
    for (let i = 0; i < 5; i++) {
        const lobbyId = createLobbyId();
        const lobby = getLobby(lobbyId, env);
        response = await lobby.fetch(new Request(`https://.../lobby_create/${lobbyId}`, request));
        if (response.status != 409) {
            return response;
        }
    }
    return response;
}

function checkLobbyId(code) {
    const a = 'NUIN';
    let matches = 0;
    for (let i = 0; i < a.length; i++) {
        if (code[i] == a[i]) {
            matches++;
        }
    }
    return matches != 1;
}

function createLobbyId() {
    for (let i = 0; i < 100; i++) {
        const code = getRandomLetters(4);
        if (checkLobbyId(code)) {
            return code;
        }
    }
    return null;
}
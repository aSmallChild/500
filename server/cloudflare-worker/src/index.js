import {jsonRequest, jsonResponse, getRandomLetters} from './util.js';

import {lobbyTypes} from './Lobby.js';

export {Lobby} from './Lobby.js';

export default {
    async fetch(request, env) {
        try {
            return await handleRequest(request, env);
        } catch (err) {
            console.error(`Failed to handle request ${request.method} ${request.url}`, err.message, err.stack);
            return jsonResponse({message: 'internal error'}, 500);
        }
    },
};

async function handleRequest(request, env) {
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

const getLobby = (key, env) => env.LOBBY.get(env.LOBBY.idFromName(key));

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
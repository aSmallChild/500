import {jsonRequest, jsonResponse, getRandomLetters} from './util.js';

import {lobbyTypes} from './Lobby.js';

export default {
    async fetch(request, env) {
        return await handleRequest(request, env);
    },
};

async function handleRequest(request, env) {
    // POST /lobby {lobbyPassword, type, user}
    //  -> DO/lobby_create

    // POST /lobby/lobbyId {lobbyPassword, user}
    //  -> DO/user_create

    // GET /lobby/lobbyId/userId
    //  -> DO/session_create/lobbyId/userId

    const url = new URL(request.url);
    const basePath = '/lobby'
    if (url.pathname == basePath) return await createLobby(request, env);

    const [lobbyId, userId] = url.pathname.replace(basePath, '').split('/');
    if (!lobbyId || lobbyId.length > 6) return jsonResponse({message: 'bad lobbyId'}, 400);

    if (lobbyId && userId) return await createSession(request, lobbyId, userId);
    if (lobbyId) return await createUser(request, lobbyId);
    return jsonResponse({message: 'bad url'}, 404);
}

async function createLobby(request, env) {
    const [json, response] = jsonRequest(request);
    if (response) return response;

    if (!lobbyTypes.includes(json?.lobby?.type)) {
        return jsonResponse({error: 'bad lobby type'}, 400);
    }

    return await findAvailableLobbyAndSetItUp(request, env);
}

async function createUser(request, lobbyId) {
    const response = jsonRequest(request)[1];
    if (response) return response;
    request.url = 'https://.../user_create';
    return getLobby(lobbyId, env).fetch(request);
}

async function createSession(request, lobbyId, userId) {
    if (request.method != 'GET') return jsonResponse({message: 'bad method'}, 405);
    if (!userId) return jsonRequest({message: 'bad userId'}, 400);
    request.url = `https://.../session_create/${lobbyId}/${userId}`;
    return getLobby(lobbyId, env).fetch(request);
}

const getLobby = (key, env) => env.LOBBY.get(env.LOBBY.idFromName(key));

async function findAvailableLobbyAndSetItUp(request, env) {
    request.url = 'https://.../create_lobby';
    let response;
    for (let i = 0; i < 5; i++) {
        const lobby = getLobby(createLobbyId(), env);
        response = await lobby.fetch(request);
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
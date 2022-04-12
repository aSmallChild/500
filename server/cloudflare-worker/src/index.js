import {jsonRequest, jsonResponse} from './util.js';

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
    //  -> DO/client_create

    // GET /session/lobbyId/clientId
    //  -> DO/client_connect/lobbyId/clientId

    const url = new URL(request.url);
    if (url.pathname == '/lobby') return await createLobby(request, env);

    const [_, path, lobbyId, clientId] = url.pathname.split('/');
    if (!lobbyId || lobbyId.length > 6) return new Response('bad lobbyId', {status: 400});
    if (path == 'lobby') return await createClient(request, lobbyId);
    if (path == 'session') return await createSession(request, lobbyId, clientId);
    return new Response('bad url', {status: 404});
}

async function createLobby(request, env) {
    const [json, response] = jsonRequest(request);
    if (response) return response;

    if (!lobbyTypes.includes(json.lobby.type)) {
        return jsonResponse({error: 'bad lobby type'}, 400);
    }

    return await findAvailableLobbyAndSetItUp(request, env);
}

async function createClient(request, lobbyId) {
    const [json, response] = jsonRequest(request);
    if (response) return response;
    request.url = 'https://.../client_create';
    return getLobby(lobbyId, env).fetch(request);
}

async function createSession(request, lobbyId, clientId) {
    if (request.method != 'GET') return new Response('bad method', {status: 405});
    if (!clientId) return new Response('bad clientId', {status: 400});
    request.url = `https://.../session_create/${lobbyId}/${clientId}`;
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

function getRandomLetters(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
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
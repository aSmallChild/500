import createSession from './createSession.js';
import {jsonRequest, jsonResponse} from './util.js';
import User from './User.js';

export const lobbyTypes = [
    'doodle',
    '500',
];

export class Lobby {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.taken = false;
        this.sessionCount = 0;
        this.users = new Map();
        this.usernames = new Map();
    }

    async fetch(request) {
        const url = new URL(request.url);
        const [path, userId] = url.pathname.substring(1).split('/');
        if (path == 'lobby_create') return this.handleCreateLobbyRequest(request);
        if (!this.taken) return jsonResponse({message: 'bad lobby'}, 404);

        if (path == 'user_create') return this.handleCreateUserRequest(request);
        if (path == 'session_create') return this.handleCreateSessionRequest(request, userId);

        return jsonResponse({message: 'bad url'}, 404);
    }

    async handleCreateLobbyRequest(request) {
        // requests
        //     POST /create_lobby
        //         body:
        //             lobby:
        //                 name: string (optional) lobby identifier
        //                 type: string (required if lobby doesn't exist, ignored if it does) whether it's a doodle or game
        //                 password: string (optional) set on lobby if its being created, checked if the lobby already exists
        //             user:
        //                 username (required)
        //                 password (optional)
        //         response
        //              lobbyId: (string)
        //                  user:
        //                      userId: string, token can be used for the session endpoint to open up a socket connection
        //                      username: string,
        //              success: boolean
        //              message: string
        if (this.taken) return jsonResponse({message: 'taken'}, 409);

        const [json, response] = await jsonRequest(request);
        if (response) return response;

        const [user, userResponse] = this.handleCreateUserJSON(json);
        if (userResponse) return userResponse;

        if (!lobbyTypes.includes(json?.lobby?.type)) {
            return jsonResponse({message: 'bad lobby type'}, 400);
        }

        // todo link to game handler

        this.taken = true;
        return jsonResponse({
            message: 'Lobby created',
            lobbyId: this.state.id, // todo check that this is actually correct
            user,
        });
    }

    async handleCreateUserRequest(request) {
        const [json, response] = await jsonRequest(request);
        if (response) return response;

        const [user, userResponse] = this.handleCreateUserJSON(json);
        if (userResponse) return userResponse;

        return jsonResponse({message: 'Logged in', user});
    }

    handleCreateUserJSON(json) {
        if (!json.user || !json.user.username) return [null, jsonResponse({message: 'bad username'}, 400)];
        const user = this.addUser(json.user.username, json.user.password);
        if (!user) return [null, jsonResponse({message: 'bad password'}, 401)];
        return [user, null];
    }

    addUser(username, password) {
        const existingUser = this.getUserByUsername(username);

        if (existingUser) {
            if (!existingUser.checkPassword(password)) {
                return false;
            }
            return existingUser;
        }

        const user = new User(username, password);
        this.users.set(user.id, user);
        this.usernames.set(user.username.toLowerCase(), user);
        return user;
    }

    getUser(userId) {
        return this.users.get(userId);
    }

    getUserByUsername(username) {
        return this.usernames.get(username.toLowerCase());
    }

    handleCreateSessionRequest(request, userId) {
        if (request.method != 'GET') return jsonResponse({message: 'bad method'}, 405);

        const user = this.getUser(userId);

        if (!user) return jsonResponse({message: 'bad user'}, 404);

        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader && upgradeHeader !== 'websocket') {
            return jsonResponse({message: 'bad upgrade'}, 426);
        }
        const [response, session] = createSession();
        this.sessionCount++;
        session.onClose = () => this.sessionCount--;
        user.add(session);
        return response;
    }
}
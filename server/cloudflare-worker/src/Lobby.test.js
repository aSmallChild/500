import {Request, Response} from 'node-fetch';
import WebSocketPair from '../test/WebSocketPair.mock.js';
import {Lobby} from './Lobby.js';

global.Request = Request;
global.Response = Response;
global.WebSocketPair = WebSocketPair;

describe('Lobby tests', () => {
    describe('POST /lobby_create', () => {
        let lobby;
        beforeEach(() => {
            lobby = new Lobby({id: 123});
        });

        const url = 'https://.../lobby_create';
        test('Must be POST', async () => {
            const request = new Request(url, {method: 'GET'});
            const response = await lobby.fetch(request);
            expect(response.status).toBe(405);
        });
        test('Must have username', async () => {
            const request = new Request(url, {
                method: 'POST', body: JSON.stringify({
                    lobby: {
                        type: 'arara',
                    },
                    user: {
                        username: '',
                    },
                }),
            });
            const response = await lobby.fetch(request);
            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.success).toBe(false);
            expect(json.message).toBe('bad username');

        });
        test('invalid type fails', async () => {
            const request = new Request(url, {
                method: 'POST', body: JSON.stringify({
                    lobby: {
                        type: 'arara',
                    },
                    user: {
                        username: 'Dog',
                        password: 'password123',
                    },
                }),
            });
            const response = await lobby.fetch(request);
            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.success).toBe(false);
            expect(json.message).toBe('bad lobby type');
        });
        test('valid type wins', async () => {
            const request = new Request(url, {
                method: 'POST', body: JSON.stringify({
                    lobby: {
                        type: '500',
                    },
                    user: {
                        username: 'Dog',
                        password: 'password123',
                    },
                }),
            });
            const response = await lobby.fetch(request);
            expect(response.status).toBe(200);
            const json = await response.json();
            expect(json.success).toBe(true);
            expect(json.message).toBe('Lobby created');
        });
    });

    describe('POST /user_create', () => {
        let lobby;
        beforeEach(async () => {
            lobby = new Lobby({id: 123});
            const request = new Request('https://.../lobby_create', {
                method: 'POST', body: JSON.stringify({
                    lobby: {
                        type: '500',
                    },
                    user: {
                        username: 'Dog',
                        password: 'password123',
                    },
                }),
            });
            const response = await lobby.fetch(request);
            expect(response.status).toBe(200)
        });

        const url = 'https://.../user_create';
        test('Must be POST', async () => {
            const request = new Request(url, {method: 'GET'});
            const response = await lobby.fetch(request);
            const json = await response.json();
            expect(json.message).toBe('bad method')
            expect(response.status).toBe(405);

        });
        test('Must have username', async () => {
            const request = new Request(url, {
                method: 'POST', body: JSON.stringify({
                    user: {
                        username: '',
                    },
                }),
            });
            const response = await lobby.fetch(request);
            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.success).toBe(false);
            expect(json.message).toBe('bad username');

        });
        test('wrong password fails', async () => {
            const response = await lobby.fetch(new Request(url, {
                method: 'POST', body: JSON.stringify({
                    user: {
                        username: 'Dog',
                        password: 'wrong password',
                    },
                }),
            }));
            expect(response.status).toBe(401);
            const json = await response.json();
            expect(json.success).toBe(false);
            expect(json.message).toBe('bad password');
        });
        test('correct password fails', async () => {
            const response = await lobby.fetch(new Request(url, {
                method: 'POST', body: JSON.stringify({
                    user: {
                        username: 'Dog',
                        password: 'wrong password',
                    },
                }),
            }));
            expect(response.status).toBe(401);
            const json = await response.json();
            expect(json.success).toBe(false);
            expect(json.message).toBe('bad password');
        });
        test('no password also wins for users that dont have passwords', async () => {
            const response1 = await lobby.fetch(new Request(url, {
                method: 'POST', body: JSON.stringify({
                    user: {
                        username: 'Cat',
                        password: '',
                    },
                }),
            }));
            expect(response1.status).toBe(200);
            const response2 = await lobby.fetch(new Request(url, {
                method: 'POST', body: JSON.stringify({
                    user: {
                        username: 'Cat',
                        password: '',
                    },
                }),
            }));
            expect(response2.status).toBe(200);
        });
    });
});
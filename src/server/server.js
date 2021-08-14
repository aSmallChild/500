import {createServer} from 'http';
import WebSocket from 'ws';
import ClientManager from './ClientManager.js';
import serverConfig from '../../config.cjs';
import fs from 'fs';

const port = serverConfig.serverPort;
const server = createServer();
const wss = new WebSocket.Server({noServer: true});
const clientManager = new ClientManager();

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head,
        ws => clientManager.socketConnected(ws));
});

server.on('request', (request, response) => {
    const indexFilePath = '/index.html';
    const filePath = './dist' + (request.url === '/' ? indexFilePath : request.url);
    const sendResponse = (status, data = null) => {
        response.writeHead(status);
        response.end(data);
        console.log(`${request.method} ${status} ${filePath}`);
    };
    if (request.method !== 'GET') {
        return sendResponse(405);
    }
    fs.readFile(filePath, (err, data) => {
            if (err) {
                return sendResponse(404);
            }
            sendResponse(200, data);
        },
    );
});

server.listen(port);
console.log(`Server listening on port ${port}`);
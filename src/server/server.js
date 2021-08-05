import {createServer} from 'http';
import WebSocket from 'ws';
import serverConfig from '../../config.js';
import fs from 'fs';

const port = serverConfig.serverPort;
const server = createServer();
const wss = new WebSocket.Server({noServer: true});

wss.on('connection', (ws) => {
    ws.on('message', data => {
        console.log(data);
    });
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
    });
});

server.on('request', (request, response) => {
    const filePath = request.url === '/' ? '/index.html' : request.url;
    fs.readFile('./../../dist/' + filePath, (err, data) => {
            if (err) {
                response.writeHead(404);
                response.end(JSON.stringify(err));
                return;
            }
            response.writeHead(200);
            response.end(data);
        },
    );
});

server.listen(port);
console.log(`Server listening on port ${port}`);
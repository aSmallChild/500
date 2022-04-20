const messageCallbacks = new Set();
const reconnectMaxIntervalSeconds = 3600;
const reconnectBackoffFactor = 1.5;
const healthCheckTimeoutMs = 60000;
let reconnectAttempts = 0;
let reconnectTimeout;
let socket;
let lastMessageTime;
let healthCheckInterval;

export function addSocketListener(onMessage) {
    messageCallbacks.add(onMessage);
    return onMessage;
}

export function removeSocketListener(onMessage) {
    messageCallbacks.delete(onMessage);
}

export function handleMessage(event, data) {
    if (event == 'ping') {
        const now = Date.now();
        sendMessage('pong', {then: data, now, diff: now - data});
        return;
    }
    if (event == 'pong') {
        return;
    }
    for (const cb of messageCallbacks) {
        try {
            cb(event, data);
        } catch (err) {
            console.error('Error while handling message.', err);
        }
    }
}

export function createSession(host, lobbyId, userId) {
    disconnectSession();
    try {
        const hostUrl = new URL([host, 'lobby', lobbyId, userId].join('/'));
        hostUrl.protocol = host.protocol === 'http:' ? 'ws:' : 'wss:';
        socket = new WebSocket(hostUrl);
        socket.addEventListener('open', () => {
            cancelReconnect();
            clearInterval(healthCheckInterval);
            setInterval(() => {
                const now = Date.now();
                if (now - lastMessageTime > healthCheckTimeoutMs) {
                    sendMessage('ping', now);
                }
            }, healthCheckTimeoutMs);
            handleMessage('open');
        });
        socket.addEventListener('message', event => {
            lastMessageTime = Date.now();
            const [eventName, data] = JSON.parse(event.data);
            handleMessage(eventName, data);
        });
        socket.addEventListener('error', event => {
            handleMessage('error', event);
            console.error('Socket error:', event);
        });
        socket.addEventListener('close', event => {
            handleMessage('close', event);
            disconnectSession();
            console.error('Socket closed', event);
            // reconnectSocket(host, lobbyId, userId);
        });
        return true;
    } catch (err) {
        console.error('WS connection failed:', host, err);
        return false;
    }
}

export function sendMessage(event, data) {
    if (!socket) return false;
    try {
        socket.send(JSON.stringify([event, data]));
        lastMessageTime = Date.now();
        return true;
    } catch (err) {
        console.error(err);
    }
    return false;
}

export function disconnectSession() {
    clearInterval(healthCheckInterval);
    cancelReconnect();
    try {
        if (socket) {
            socket.close();
        }
    } catch (err) {
        console.error('Error while closing socket', err);
    }
    socket = null;
}

function reconnectSocket(host, lobbyId, userId) {
    if (socket) {
        cancelReconnect();
        return;
    }
    reconnectAttempts++;
    console.log('Attempting to reconnect to:', reconnectAttempts);
    reconnectTimeout = setTimeout(() => {
        if (!createSession(host, lobbyId, userId)) {
            reconnectSocket(host, lobbyId, userId);
        }
    }, Math.min(reconnectMaxIntervalSeconds, Math.pow(reconnectAttempts, reconnectBackoffFactor)) * 1000);

}

function cancelReconnect() {
    reconnectAttempts = 0;
    clearTimeout(reconnectTimeout);
}
const messageCallbacks = new Set();
const reconnectMaxIntervalSeconds = 3600;
const reconnectBackoffFactor = 1.5;
const healthCheckTimeoutMs = 60000;
let reconnecting = false;
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

export async function createSession(host, lobbyId, userId, userPassword, reconnect = false) {
    if (socket) return false;
    let opened = false;
    return new Promise(actualResolve => {
        let resolved = false;
        const wrappedResolve = value => {
            if (!resolved) {
                resolved = true;
                actualResolve(value);
            }
        };

        const hostUrl = new URL([host, 'lobby', lobbyId, userId].join('/'));
        hostUrl.protocol = host.protocol === 'http:' ? 'ws:' : 'wss:';
        socket = new WebSocket(hostUrl);

        const sessionAcceptedListener = event => {
            const [eventName] = JSON.parse(event.data);
            if (eventName !== 'session:accepted') {
                disconnectSession();
                return;
            }
            socket.addEventListener('message', event => {
                lastMessageTime = Date.now();
                const [eventName, data] = JSON.parse(event.data);
                handleMessage(eventName, data);
            });
            clearInterval(healthCheckInterval);
            setInterval(() => {
                const now = Date.now();
                if (now - lastMessageTime > healthCheckTimeoutMs) {
                    sendMessage('ping', now);
                }
            }, healthCheckTimeoutMs);
            wrappedResolve(true);
            handleMessage('open');
        };

        socket.addEventListener('message', sessionAcceptedListener, {once: true});

        socket.addEventListener('open', () => {
            opened = true;
            cancelReconnect();
            if (userPassword) {
                sendMessage('session:password', userPassword);
            }
        });
        socket.addEventListener('error', event => handleMessage('error', event));
        socket.addEventListener('close', event => {
            socket = null;
            clearInterval(healthCheckInterval);
            if (!opened) {
                return wrappedResolve(false);
            }
            console.error('Socket closed', event.code, event.reason);
            handleMessage('close', event);
            if (!event.wasClean && reconnect) {
                reconnectSocket(host, lobbyId, userId, userPassword);
            }
        });

    });
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

const waitMs = ms => new Promise(win => setTimeout(win, ms));

async function reconnectSocket(host, lobbyId, userId, userPassword) {
    if (reconnecting) {
        console.log('Already reconnecting...');
        return;
    }
    let reconnectAttempts = 0;
    reconnecting = true;
    while (reconnecting) {
        reconnectAttempts++;
        console.log('Attempting to reconnect to:', reconnectAttempts);
        if (await createSession(host, lobbyId, userId, userPassword, true)) {
            console.log('Reconnected.');
            return cancelReconnect();
        }
        await waitMs(Math.min(reconnectMaxIntervalSeconds, Math.pow(reconnectAttempts, reconnectBackoffFactor)) * 1000);
    }
}

function cancelReconnect() {
    reconnecting = false;
}

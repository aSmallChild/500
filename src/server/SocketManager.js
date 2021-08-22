import DoodleServer from '../../doodle/DoodleServer.js';
import WebsocketWrapper from 'ws-wrapper';
import Channel from './Channel.js';

WebsocketWrapper.MAX_SEND_QUEUE_SIZE = 0;

export default class SocketManager {
    constructor() {
        this.channels = new Map();
    }

    socketConnected(nativeSocket) {
        const socket = new WebsocketWrapper(nativeSocket);
        socket.on('message', (event, data) => {
            data = JSON.parse(data);
            const channelKey = data.c || '';
            const eventName = data.a[0];
            if (!channelKey) {
                return;
            }

            const [prefix, channelName] = channelKey.indexOf(Channel.delimiter) > 0 ? channelKey.split(Channel.delimiter) : [null, channelKey];
            const password = data.password || null;
            if (eventName === 'channel:login') {
                if (channelName === 'doodle') {
                    return this.doodleChannelLogin(socket, prefix, channelName, password);
                }
            }
        });
        return socket;
    }

    doodleChannelLogin(socket, prefix, channelName, password) {
        const channelKey = Channel.createChannelKey(prefix, channelName);
        if (this.channels.has(channelKey)) {
            const channel = this.channels.get(channelKey);
            channel.channelLogin(socket, password);
            return;
        }
        const channel = new Channel(prefix, channelName, password);
        this.channels.set(channelKey, channel);

        new DoodleServer(channel);

        channel.channelLogin(socket, password);
    }
}
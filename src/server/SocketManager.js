import DoodleServer from '../../doodle/DoodleServer.js';
import WebsocketWrapper from 'ws-wrapper';
import Channel from './Channel.js';
import Lobby from '../game/stage/Lobby.js';
import Bidding from '../game/stage/Bidding.js';
import Kitty from '../game/stage/Kitty.js';
import Game from '../game/Game.js';

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

            const channel = this.channels.get(channelKey);
            if (eventName === 'channel:join') {
                const password = data.password || null;
                return this.handleChannelLogin(channel, socket, prefix, channelName, password);
            }
        });
        return socket;
    }

    handleChannelLogin(channel, socket, prefix, channelName, password) {
        if (!channel) {
            channel = this.createChannelController(prefix, channelName, password);
        }

        const socketChannel = socket.of(Channel.createChannelKey(prefix, channelName));
        if (!channel) {
            socketChannel.emit('channel:join', {success: false, error: 'Invalid channel prefix.'});
            return;
        }
        const response = {
            success: channel.channelLogin(socket, password)
        };
        socketChannel.emit('channel:join', response);
    }

    createChannel(prefix, channelName, password) {
        const channel = new Channel(prefix, channelName, password);
        this.channels.set(channel.channelKey, channel);
        return channel;
    }

    createGame(channel) {
        const stages = [
            Lobby,
            Bidding,
            Kitty
        ];
        new Game(stages, channel);
        return channel;
    }

    createDoodle(channel) {
        new DoodleServer(channel);
        return channel;
    }

    createChannelController(prefix, channelName, password) {
        if (prefix === 'games') {
            return this.createGame(this.createChannel(prefix, channelName, password));
        }
        if (prefix === 'doodle') {
            return this.createDoodle(this.createChannel(prefix, channelName, password));
        }
        return null;
    }
}
import Player from '../../lib/game/model/Player.js';
import Channel from '../../lib/server/Channel.js';
import ChannelClient from '../../lib/server/ChannelClient.js';

export function getPlayers(count, positions = false) {
    const players = [];
    for (let i = 0; i < count; i++) {
        const player = new Player((i + 10).toString(36), new ChannelClient('' + i, 'b'));
        if (positions) player.position = i;
        players.push(player);
    }
    return players;
}

export function getStage(players, constructor) {
    const channel = new Channel('a', 'b', 'c');
    const stage = new constructor();
    stage.setDataStore({});
    stage.setPlayers(players);
    stage.setChannel(channel);
    return stage;
}
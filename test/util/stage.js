import Player from '../../lib/game/model/Player.js';
import User from '../../lib/server/User.js';

export function getPlayers(count) {
    const players = [];
    for (let i = 0; i < count; i++) {
        const player = new Player((i + 10).toString(36), new User('' + i, 'b'));
        player.position = i;
        players.push(player);
    }
    return players;
}

export function getStage(players, constructor) {
    const stage = new constructor();
    stage.setDataStore({});
    stage.setPlayers(players);
    stage.setServer({emit() {}});
    return stage;
}
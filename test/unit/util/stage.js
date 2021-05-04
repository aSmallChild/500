import Player from '../../../src/game/model/Player.js';

export function getPlayers(count) {
    const players = [];
    for (let i = 0; i < count; i++) {
        players.push(new Player((i + 10).toString(36), null));
    }
    return players;
}

export function getStage(players, constructor) {
    const stage = new constructor();
    stage.setDataStore({});
    stage.setNotifyClientCallback(() => {});
    stage.setPlayers(players);
    return stage;
}
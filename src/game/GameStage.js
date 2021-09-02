/* eslint-disable no-unused-vars */
export default class GameStage {
    onStageComplete(onStageComplete) {
        this._onStageComplete = onStageComplete;
    }

    complete(dataForNextStage) {
        this._onStageComplete(dataForNextStage, this.dataStore);
        for (const key of Object.keys(this)) {
            delete this[key];
        }
    }

    setDataStore(dataStore) {
        this.dataStore = dataStore;
    }

    setPlayers(players) {
        this.players = players;
    }

    setChannel(channel) {
        this.channel = channel;
    }

    getPlayerByName(name) {
        if (!name) return null;
        for (const player of this.players) {
            if (player.name.toLowerCase() === name.toLowerCase()) return player;
        }
        return null;
    }

    start(dataFromPreviousStage) {}

    onPlayerAction(player, actionName, actionData) {}

    onPlayerConnect(player, socket) {}

    onObserver(observer) {}

    emitStageMessage(name, data, socket) {
        socket = socket || this.channel;
        socket.emit('stage:action', {name, data});
    }
}
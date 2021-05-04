export default class GameStage {
    onStageComplete(onStageComplete) {
        this._onStageComplete = onStageComplete;
    }

    complete(dataForNextStage) {
        this.setNotifyClientCallback(null);
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

    getPlayerByName(name) {
        if (!name) return null;
        for (const player of this.players) {
            if (player.name.toLowerCase() === name.toLowerCase()) return player;
        }
        return null;
    }

    setNotifyClientCallback(notifyClients) {
        this._notifyClients = notifyClients;
    }

    notifyClients(actionName, actionData) {
        this._notifyClients(actionName, actionData);
    }

    start(dataFromPreviousStage) {}

    onPlayerAction(player, actionName, actionData) {}

    onPlayerConnect(player) {}

    onSpectatorConnect(spectator) {}
}
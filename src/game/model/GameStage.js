export default class GameStage {
    onStageComplete(onStageComplete) {
        this._onStageComplete = onStageComplete;
    }

    complete(dataForNextStage) {
        this._onStageComplete(dataForNextStage, this.dataStore);
        this._onStageComplete = null;
        this.setNotifyClientCallback(null);
        this.players = null;
        this.initialStageData = null;
        this.dataStore = null;
    }

    setDataStore(dataStore) {
        this.dataStore = dataStore;
    }

    setPlayers(players) {
        this.players = players;
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
export default class GameStage {
    constructor(onStageComplete, notifyClients, players, initialStageData, dataStore) {
        if (typeof onStageComplete !== 'function') throw new Error('onStageComplete callback is not a function');
        this._onStageComplete = onStageComplete;
        if (typeof notifyClients !== 'function') throw new Error('notifyClients callback is not a function');
        this._notifyClients = notifyClients;
        this.players = players;
        this.initialStageData = initialStageData;
        this.dataStore = dataStore;
    }

    start() {}

    complete(dataForNextStage) {
        // remove any references that might prevent garbage collection
        this._onStageComplete(JSON.parse(JSON.stringify(dataForNextStage)), JSON.parse(JSON.stringify(this.dataStore)));
        this._onStageComplete = null;
        this._notifyClients = null;
        this.players = null;
        this.initialStageData = null;
        this.dataStore = null;
    }

    notifyClients(actionName, actionData) {
        this._notifyClients(actionName, actionData);
    }

    onPlayerAction(player, actionName, actionData) {}

    onPlayerConnect(player) {}

    onSpectatorConnect(spectator) {}
}
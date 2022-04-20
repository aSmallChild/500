/* eslint-disable no-unused-vars */
export default class GameStage {
    #server;

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

    setServer(server) {
        this.#server = server;
    }

    getPlayerByName(name) {
        if (!name) return null;
        for (const player of this.players) {
            if (player.name.toLowerCase() === name.toLowerCase()) return player;
        }
        return null;
    }

    getPlayerById(clientId) {
        if (!clientId) return null;
        for (const player of this.players) {
            if (player.id === clientId) return player;
        }
        return null;
    }

    start(dataFromPreviousStage) {}

    onStageAction(player, socket, actionName, actionData) {}

    onPlayerConnect(player, socket) {}

    onPlayerDisconnect(player) {}

    onObserverConnect(socket) {}

    onObserverDisconnect(socket) {}

    emitStageMessage(actionName, actionData, socket) {
        socket = socket || this.#server;
        socket.emit('stage:action', {actionName, actionData});
    }
}
export default class Game {
    constructor(stages) {
        this.stages = stages;
        this.currentStage = null;
        this.currentStageIndex = -1;
        this.players = [];
        this.spectators = [];
        this.dataStore = {};
    }

    notifyClients(actionName, actionData) {}

    onPlayerAction(player, actionName, actionData) {
        if (!this.currentStage) return;
        this.currentStage.onPlayerAction(player, actionName, actionData);
    }

    onPlayerConnect(player) {
        if (!this.currentStage) return;
        this.currentStage.onPlayerConnect(player);
    }

    onSpectatorConnect(spectator) {
        if (!this.currentStage) return;
        this.currentStage.onSpectatorConnect(spectator);
    }

    nextStage(dataFromPreviousStage) {
        if (++this.currentStageIndex >= this.stages.length) {
            this.currentStageIndex = 0;
        }
        this.currentStage = new this.stages[this.currentStageIndex]();
        this.currentStage.onStageComplete((dataForNextStage, dataToStore) => {
            this.dataStore[this.currentStage.constructor.name] = JSON.parse(JSON.stringify(dataToStore));
            this.currentStage = null;
            setTimeout(() => this.nextStage(JSON.parse(JSON.stringify(dataForNextStage))), 1);
        });
        this.currentStage.setDataStore(this.dataStore[this.currentStage.constructor.name] || {});
        this.currentStage.setNotifyClientCallback(this.notifyClients);
        this.currentStage.setPlayers(this.players);
        this.currentStage.start(dataFromPreviousStage);
    }
}


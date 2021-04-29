export default class Game {
    constructor(stages) {
        this.stages = stages;
        this.currentStage = null;
        this.currentStageIndex = -1;
        this.players = [];
        this.spectators = [];
        this.dataStore = [];
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

    nextStage(initialStageData) {
        if (++this.currentStageIndex === this.stages.length) {
            this.currentStageIndex = 0;
        }
        const stageDataStore = this.dataStore[this.currentStageIndex] || {};
        this.currentStage = new this.stages[this.currentStageIndex](
            (dataForNextStage, dataToStore) => {
                this.dataStore[currentStageIndex] = dataToStore;
                this.nextStage(dataForNextStage);
            },
            this.notifyClients,
            this.players,
            initialStageData,
            stageDataStore,
        );
        this.currentStage.start();
    }
}


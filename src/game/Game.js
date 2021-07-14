export default class Game {
    constructor(stages) {
        this.stages = stages;
        this.dataStore = {};
        this.currentStage = null;
        this.currentStageIndex = -1;
        this.players = [];
        this.spectators = [];
        this.clients = {
            emit: (actionName, actionData) => {
                for (const client of [...this.players, ...this.spectators]) {
                    client.emit(actionName, actionData);
                }
            },
        };
    }

    onPlayerAction(player, actionName, actionData) {
        if (!this.currentStage) return;
        this.currentStage.onPlayerAction(player, actionName, actionData);
    }

    onPlayerConnect(player) {
        player.emit('players', this.players);
        if (!this.currentStage) return;
        player.emit('stage', this.currentStage.name.toLowerCase());
        this.currentStage.onPlayerConnect(player);
    }

    onSpectatorConnect(spectator) {
        spectator.emit('players', this.players);
        if (!this.currentStage) return;
        spectator.emit('stage', this.currentStage.name.toLowerCase());
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
        this.currentStage.setPlayers(this.players);
        this.currentStage.setSpectators(this.spectators);
        this.currentStage.setClients(this.clients);
        this.currentStage.start(dataFromPreviousStage);
    }
}

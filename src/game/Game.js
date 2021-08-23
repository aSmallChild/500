import Player from './model/Player.js';

export default class Game {
    constructor(stages, channel) {
        this.stages = stages;
        this.dataStore = {};
        this.currentStage = null;
        this.currentStageIndex = -1;
        this.players = [];
        this.clientPlayers = new WeakMap();
        this.setChannel(channel);
    }

    setChannel(channel) {
        this.channel = channel;
        channel.onObserver(observer => this.onObserver(observer));
        channel.onClient((client, socket) => {
            const player = this.getOrMaybeEvenCreatePlayerForClient(client);
            if (!player) {
                return;
            }

            this.onPlayerConnect(player, socket);

            socket.on('player:action', data => {
                this.onPlayerAction(player, socket, data.actionName, data.actionData); // todo implement this client side
            });
        });
    }

    getOrMaybeEvenCreatePlayerForClient(client) {
        const player = this.clientPlayers.get(client);
        if (player) {
            return player;
        }

        // create players for clients on the first stage
        if (!this.currentStageIndex) {
            return this.createPlayerForClient(client);
        }

        return null;
    }

    createPlayerForClient(client) {
        const player = new Player(client.name, client);
        this.clientPlayers.set(client, player);
        this.players.push(player);
        return player;
    }

    onPlayerAction(player, socket, actionName, actionData) {
        if (!this.currentStage) return;
        this.currentStage.onPlayerAction(player, socket, actionName, actionData);
    }

    onPlayerConnect(player) {
        player.emit('players', this.players);
        if (!this.currentStage) return;
        player.emit('stage', this.currentStage.name.toLowerCase());
        this.currentStage.onPlayerConnect(player);
    }

    onObserver(observer) {
        observer.emit('players', this.players);
        if (!this.currentStage) return;
        observer.emit('stage', this.currentStage.name.toLowerCase());
        this.currentStage.onObserver(observer);
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
        this.currentStage.setChannel(this.channel);
        this.currentStage.start(dataFromPreviousStage);
    }
}

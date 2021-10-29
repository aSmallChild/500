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
            if (!player) return;

            this.onPlayerConnect(player, socket);

            socket.on('stage:action', ({actionName, actionData}) => {
                console.log('STAGE ACTION', actionName, actionData) // todo debug this to see why it is sometimes called twice
                this.onStageAction(player, socket, actionName, actionData);
            });

            socket.on('game:action', ({actionName, actionData}) => {
                console.log('GAME ACTION', actionName, actionData)
                this.onGameAction(player, socket, actionName, actionData);
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

    emitPlayers(socket) {
        (socket || this.channel).emit('game:players', this.players);
    }

    emitStage(socket) {
        try {
            (socket || this.channel).emit('game:stage', this.currentStage.constructor.name.toLowerCase());
        } catch (e) {
            console.error(e);
        }
    }

    onStageAction(player, socket, actionName, actionData) {
        const response = this.currentStage.onStageAction(player, actionName, actionData);
        if (response) {
            socket.emit(actionName, response);
        }
    }

    onPlayerConnect(player, socket) {
        this.emitPlayers();
        this.emitStage(socket);
        this.currentStage.onPlayerConnect(player, socket);
    }

    onObserver(observer) {
        this.emitPlayers(observer);
        this.emitStage(observer);
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
            process.nextTick(() => {
                try {
                    const data = JSON.parse(JSON.stringify(dataForNextStage || {}));
                    this.nextStage(data);
                } catch (e) {
                    console.error(e);
                }
            });
        });
        this.currentStage.setDataStore(this.dataStore[this.currentStage.constructor.name] || {});
        this.currentStage.setPlayers(this.players);
        this.currentStage.setChannel(this.channel);
        this.currentStage.start(dataFromPreviousStage);
    }

    onGameAction(player, socket, actionName, actionData) {
        if (!player.isAdmin) return;
        if (actionName === 'grant_admin') return this.grantAdmin(actionData);
        if (actionName === 'kick_player') return this.kickPlayer(actionData);
    }

    grantAdmin(clientId) {
        const otherPlayer = this.currentStage.getPlayerById(clientId);
        if (!otherPlayer || otherPlayer.isAdmin) return;
        otherPlayer.isAdmin = true;
        this.emitPlayers();
    }

    kickPlayer(clientId) {
        const otherPlayer = this.currentStage.getPlayerById(clientId);
        if (!otherPlayer) return;
        this.channel.disconnectClient(otherPlayer.client, 4001, 'kicked');
        this.players.splice(this.players.indexOf(otherPlayer), 1);
        this.emitPlayers();
    }
}

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
        channel.onObserverDisconnect((observer, client) => this.onObserverDisconnect(observer, client));
        channel.onClient((client, socket) => {
            const player = this.getOrMaybeEvenCreatePlayerForClient(client);
            if (!player) return;

            socket.removeAllListeners('stage:action');
            socket.on('stage:action', ({actionName, actionData}) => {
                const msgStart = `STAGE ${this.currentStage.constructor.name} ${channel.name.toUpperCase()}/${client.id}: `;
                try {
                    console.log(msgStart, actionName, actionData);
                    this.onStageAction(player, socket, actionName, actionData);
                } catch (e) {
                    console.error(msgStart, actionName, actionData, e);
                }
            });

            socket.removeAllListeners('game:action');
            socket.on('game:action', ({actionName, actionData}) => {
                const msgStart = `GAME ${this.currentStage.constructor.name} ${channel.name.toUpperCase()}/${client.id}: `;
                try {
                    console.log(msgStart, actionName, actionData);
                    this.onGameAction(player, socket, actionName, actionData);
                } catch (e) {
                    console.error(msgStart, actionName, actionData, e);
                }
            });

            this.onPlayerConnect(player, socket);
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
        if (this.players.length === 1) {
            player.isAdmin = true;
        }
        this.emitStage(socket);
        socket.removeAllListeners('stage:mounted');
        socket.on('stage:mounted', () => {
            this.emitPlayers();
            this.currentStage.onPlayerConnect(player, socket);
        });
    }

    onObserver(observer) {
        this.emitStage(observer);
        observer.removeAllListeners('stage:mounted');
        observer.on('stage:mounted', () => {
            this.emitPlayers(observer);
            this.currentStage.onObserver(observer);
        });
    }

    onObserverDisconnect(observer, client) {
        this.currentStage.onObserverDisconnect(observer, client);
        this.emitPlayers();
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
        this.emitStage();
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
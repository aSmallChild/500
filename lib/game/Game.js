import Player from './model/Player.js';
import SessionCollection from '../server/SessionCollection.js';

export default class Game {
    constructor(stages) {
        this.stages = stages;
        this.dataStore = {};
        this.currentStage = null;
        this.currentStageIndex = -1;
        this.players = [];
        this.userPlayers = new WeakMap();
        this.users = new SessionCollection();
        this.observers = new SessionCollection();
    }

    onUserSession(user, session) {
        const player = this.getOrMaybeEvenCreatePlayerForUser(user);
        if (!player) {
            return this.onObserverSession(session);
        }

        this.users.add(session);
        this.onPlayerConnect(player, session);
        session.onMessage((event, data) => this.onPlayerMessage(player, session, event, data));
        session.onClose(() => {
            this.currentStage.onPlayerDisconnect(player);
            this.emitPlayers();
        });
    }

    onPlayerMessage(player, session, event, data) {
        switch (event) {
            case 'stage:mounted':
                this.currentStage.onPlayerConnect(player, session);
                return;
            case 'stage:action': {
                const {actionName, actionData} = data;
                try {
                    this.onStageAction(player, session, actionName, actionData);
                }
                catch (e) {
                    console.error(`STAGE ${this.currentStage.constructor.name} ${player.id}:`, actionName, actionData, e);
                    session.emit('internal_error', {
                        stage: this.currentStage.constructor.name,
                        message: e.toString(),
                        stack: e.stack,
                        event,
                        actionName,
                        actionData,
                    });
                }
                return;
            }
            case 'game:action': {
                const {actionName, actionData} = data;
                try {
                    this.onGameAction(player, session, actionName, actionData);
                }
                catch (e) {
                    console.error(`GAME ${this.currentStage.constructor.name} ${player.id}:`, actionName, actionData, e);
                    session.emit('internal_error', {
                        stage: this.currentStage.constructor.name,
                        message: e.toString(),
                        stack: e.stack,
                        event,
                        actionName,
                        actionData,
                    });
                }
                return;
            }
        }
    }

    onObserverSession(session) {
        this.observers.add(session);
        session.onMessage((event, data) => this.onObserverMessage(session, event, data));
        session.onClose(() => this.currentStage.onObserverDisconnect());
    }

    onObserverMessage(session, event, data) {
        switch (event) {
            case'stage:mounted':
                this.emitPlayers(session);
                this.currentStage.onObserverConnect(session);
                return;
        }
    }

    emit(...args) {
        this.users.emit(...args);
        this.observers.emit(...args);
    }

    getOrMaybeEvenCreatePlayerForUser(user) {
        const player = this.userPlayers.get(user);
        if (player) {
            return player;
        }

        // only create players for users on the first stage
        if (!this.currentStageIndex) {
            return this.createPlayerForUser(user);
        }

        return null;
    }

    createPlayerForUser(user) {
        const player = new Player(user.username, user);
        this.userPlayers.set(user, player);
        this.players.push(player);
        return player;
    }

    emitPlayers(socket) {
        (socket ?? this).emit('game:players', this.players);
    }

    emitStage(socket) {
        try {
            (socket || this).emit('game:stage', this.currentStage.constructor.name.toLowerCase());
        }
        catch (e) {
            console.error(e.message, e.stack);
        }
    }

    onStageAction(player, socket, actionName, actionData) {
        const response = this.currentStage.onStageAction(player, socket, actionName, actionData);
        if (response) {
            socket.emit(actionName, response);
        }
    }

    onPlayerConnect(player, socket) {
        if (this.players.length === 1) {
            player.isAdmin = true;
        }
        this.emitPlayers();
        this.emitStage(socket);
    }

    onObserverDisconnect(observer, user) {
        this.currentStage.onObserverDisconnect(observer, user);
        this.emitPlayers();
    }

    nextStage(dataFromPreviousStage) {
        if (++this.currentStageIndex >= this.stages.length) {
            this.currentStageIndex = 0;
        }
        this.currentStage = new this.stages[this.currentStageIndex]();
        this.currentStage.onStageComplete((dataForNextStage, dataToStore) => {
            this.dataStore[this.currentStage.constructor.name] = JSON.parse(JSON.stringify(dataToStore));
            try {
                const data = JSON.parse(JSON.stringify(dataForNextStage || {}));
                this.nextStage(data);
            }
            catch (e) {
                console.error(e);
            }
        });
        this.currentStage.setDataStore(this.dataStore[this.currentStage.constructor.name] || {});
        this.currentStage.setPlayers(this.players);
        this.currentStage.setServer({
            emit: (...args) => this.emit(...args),
        });
        this.currentStage.start(dataFromPreviousStage);
        this.emitStage();
        this.emitPlayers();
    }

    onGameAction(player, socket, actionName, actionData) {
        if (!player.isAdmin) return;
        if (actionName === 'grant_admin') return this.grantAdmin(actionData);
        if (actionName === 'kick_player') return this.kickPlayer(actionData);
    }

    grantAdmin(userId) {
        const otherPlayer = this.currentStage.getPlayerById(userId);
        if (!otherPlayer || otherPlayer.isAdmin) return;
        otherPlayer.isAdmin = true;
        this.emitPlayers();
    }

    kickPlayer(userId) {
        const otherPlayer = this.currentStage.getPlayerById(userId);
        if (!otherPlayer) return;
        otherPlayer.user.close(4001, 'kicked');
        this.players.splice(this.players.indexOf(otherPlayer), 1);
        this.emitPlayers();
    }
}

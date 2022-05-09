import Player from './model/Player.js';
import SessionCollection from '../server/SessionCollection.js';

export default class Game {
    constructor(stages) {
        this.stages = stages;
        this.dataStore = {};
        this.currentStage = null;
        this.currentStageIndex = -1;
        this.players = [];
        this.playerUsers = new WeakMap();
        this.users = new SessionCollection();
        this.observers = new SessionCollection();
    }

    onUserSession(user, session) {
        this.onObserverSession(session);

        const player = this.getOrMaybeEvenCreatePlayerForUser(user);
        if (!player) return;

        this.users.add(session);
        this.onPlayerConnect(player, session);
        session.onMessage((event, data) => this.onPlayerMessage(player, session, event, data));
        session.onClose(() => this.currentStage.onPlayerDisconnect(player));
    }

    onPlayerMessage(player, session, event, data) {
        if (event == 'stage:mounted') {
            this.emitPlayers();
            this.currentStage.onPlayerConnect(player, session);
            return;
        }

        if (event == 'stage:action') {
            const {actionName, actionData} = data;
            const msgStart = `STAGE ${this.currentStage.constructor.name} ${player.id}: `;
            try {
                console.log(msgStart, actionName, actionData);
                this.onStageAction(player, session, actionName, actionData);
            } catch (e) {
                console.error(msgStart, actionName, actionData, e);
            }
            return;
        }

        if (event == 'game:action') {
            const {actionName, actionData} = data;
            const msgStart = `GAME ${this.currentStage.constructor.name} ${player.id}: `;
            try {
                console.log(msgStart, actionName, actionData);
                this.onGameAction(player, session, actionName, actionData);
            } catch (e) {
                console.error(msgStart, actionName, actionData, e);
            }
            return;
        }
    }

    onObserverSession(session) {
        this.observers.add(session);
        this.currentStage.onObserverConnect(session);
        session.onMessage((event, data) => this.onObserverMessage(session, event, data));
        session.onClose(() => this.currentStage.onObserverDisconnect());
    }

    onObserverMessage(session, event, data) {
        if (event == 'stage:mounted') {
            this.emitStage(session);
            this.emitPlayers(session);
        }
    }

    emit(...args) {
        this.observers.emit(...args);
    }

    getOrMaybeEvenCreatePlayerForUser(user) {
        const player = this.playerUsers.get(user);
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
        this.playerUsers.set(user, player);
        this.players.push(player);
        return player;
    }

    emitPlayers(socket) {
        (socket || this).emit('game:players', this.players);
    }

    emitStage(socket) {
        try {
            (socket || this).emit('game:stage', this.currentStage.constructor.name.toLowerCase());
        } catch (e) {
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
            } catch (e) {
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
        this.channel.disconnectUser(otherPlayer.user, 4001, 'kicked'); // todo
        this.players.splice(this.players.indexOf(otherPlayer), 1);
        this.emitPlayers();
    }
}

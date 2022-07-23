import GameStage from '../GameStage.js';
import DeckConfig from '../model/DeckConfig.js';
import OrdinaryNormalDeck from '../model/OrdinaryNormalDeck.js';

export default class Lobby extends GameStage {
    start(dataFromPreviousStage = {}) {
        this.dataForNextStage = dataFromPreviousStage;

        if (dataFromPreviousStage.deckConfig) {
            this.deckConfig = new DeckConfig(dataFromPreviousStage.deckConfig);
        }
        else {
            this.deckConfig = new DeckConfig(OrdinaryNormalDeck.config);
        }

        if (dataFromPreviousStage.winner) {
            this.dataStore.gameInProgress = false; // todo
        }

        if (this.dataStore.gameInProgress) {
            return this.complete(this.getDataForNextStage());
        }

        if (!this.dataStore.preferredPartners) {
            this.dataStore.preferredPartners = {};
        }

        this.readyPlayers = new Set();
    }

    onStageAction(player, socket, actionName, actionData) {
        if (actionName === 'partner') return this.requestPartner(player, actionData);
        if (actionName === 'ready') return this.playerReady(player, actionData);

        if (!player.isAdmin) return;
        if (actionName === 'start') return this.startGame();
        if (actionName === 'config') return this.updateGameConfig(player, actionData);
    }

    onPlayerConnect(player, socket) {
        if (this.deckConfig.totalHands !== this.players.length) {
            this.deckConfig.totalHands = this.players.length;
            this.emitGameConfig();
        }
        else {
            this.emitGameConfig(socket);
        }
        this.emitPartners(socket);
        this.emitReadyPlayers(socket);
        this.emitPlayerScores(socket);
    }

    onObserverConnect(observer) {
        this.emitGameConfig(observer);
        this.emitPartners(observer);
        this.emitReadyPlayers(observer);
        this.emitPlayerScores(observer);
    }

    requestPartner(player, clientId) {
        const store = this.dataStore.preferredPartners;
        if (store[player.id] && store[player.id] !== clientId) {
            delete store[player.id]; // keep requests in order
        }
        if (this.getPlayerById(clientId)) store[player.id] = clientId;
        this.emitPartners();
    }

    playerReady(player, isReady) {
        if (isReady) this.readyPlayers.add(player.id);
        else this.readyPlayers.delete(player.id);
        this.emitReadyPlayers();
        if (this.players.length < 2) return;
        if (this.readyPlayers.size === this.players.length) this.startGame();
    }

    resetPlayerPositionsAndPartners() {
        for (const player of this.players) {
            player.position = null;
            player.clearPartner();
        }
    }

    setPlayerPositions() {
        let position = 0;
        for (const player of this.players) {
            if (player.position !== null) continue;
            player.position = position;
            if (player.partner) player.partner.position = position + this.players.length / 2;
            position++;
        }
        this.players.sort((a, b) => a.position > b.position ? 1 : -1);
    }

    getDataForNextStage() {
        //todo maybe pass in player scores
        return {
            ...this.dataForNextStage,
            deckConfig: this.deckConfig,
            playerScores: this.dataForNextStage?.playerScores ?? this.players.map(() => 0)
        };
    }

    startGame() {
        this.resetPlayerPositionsAndPartners();
        if (!(this.players.length % 2) && 4 <= this.players.length && this.players.length <= 10) {
            this.matchPartners(this.dataStore.preferredPartners);
        }
        this.setPlayerPositions();
        this.dataStore.gameInProgress = true;
        this.complete(this.getDataForNextStage());
    }

    matchPartners(outgoingRequests) {
        if (this.players.length % 2) {
            throw new Error(`Attempted to pair up an odd number of players.`);
        }
        const incomingRequestsPerPlayer = {};
        for (const playerId of Object.keys(outgoingRequests)) {
            const partnerId = outgoingRequests[playerId];
            if (!incomingRequestsPerPlayer[partnerId]) incomingRequestsPerPlayer[partnerId] = new Set();
            incomingRequestsPerPlayer[partnerId].add(playerId);
        }

        for (const player of this.players) {
            if (player.partner) continue;

            const incomingRequests = incomingRequestsPerPlayer[player.id] || new Set();
            let partner = this.getPlayerById(outgoingRequests[player.id]);

            // can't be your own partner
            if (partner === player) partner = null;

            // they want each other
            if (partner && incomingRequests.has(partner.id)) {
                player.setPartner(partner);
                continue;
            }

            // nobody else wanted this player as their partner
            if (partner && !partner.partner && !incomingRequestsPerPlayer[partner.id]) {
                player.setPartner(partner);
                continue;
            }

            for (const otherPlayer of this.players) {
                if (otherPlayer.partner || otherPlayer === player) continue;

                if (!partner || partner.partner) {
                    partner = otherPlayer;
                    continue;
                }

                // current matched player did not want to be our partner, but this other play does
                if (!incomingRequests.has(partner.id) && incomingRequests.has(otherPlayer.id)) {
                    partner = otherPlayer;
                }
            }

            player.setPartner(partner);
        }
    }

    updateGameConfig(player, submittedConfig) {
        this.deckConfig.cardsPerHand = submittedConfig.cardsPerHand;
        this.deckConfig.kittySize = submittedConfig.kittySize;
        this.emitGameConfig();
    }

    emitGameConfig(client) {
        this.emitStageMessage('config', this.deckConfig, client);
    }

    emitPartners(client) {
        this.emitStageMessage('partners', this.dataStore.preferredPartners, client);
    }

    emitReadyPlayers(client) {
        this.emitStageMessage('ready_players', Array.from(this.readyPlayers), client);
    }

    emitPlayerScores(client) {
        if (this.dataForNextStage.playerScores) {
            this.emitStageMessage('player_scores', this.dataForNextStage.playerScores, client);
        }
        if (this.dataForNextStage.winner) {
            this.emitStageMessage('winner', this.dataForNextStage.winner, client);
        }
    }
}
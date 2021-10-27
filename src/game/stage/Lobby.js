import GameStage from '../GameStage.js';
import DeckConfig from '../model/DeckConfig.js';
import OrdinaryNormalDeck from '../model/OrdinaryNormalDeck.js';

export default class Lobby extends GameStage {
    start(dataFromPreviousStage) {
        dataFromPreviousStage = dataFromPreviousStage || {};
        if (dataFromPreviousStage.gameOver) {
            this.dataStore.gameInProgress = false; // todo
        }
        if (this.dataStore.gameInProgress) return this.complete();

        if (!this.dataStore.preferredPartners) {
            this.dataStore.preferredPartners = {};
        }
        this.readyPlayers = new Set();
        this.deckConfig = new DeckConfig(OrdinaryNormalDeck.config);
    }

    onPlayerAction(player, actionName, actionData) {
        if (actionName === 'partner') return this.requestPartner(player, actionData);
        if (actionName === 'ready') return this.playerReady(player, true);
        if (actionName === 'not_ready') return this.playerReady(player, false);
        if (actionName === 'start_game' && player.isAdmin) return this.startGame();
        if (actionName === 'give_admin' && player.isAdmin) return this.grantAdmin(actionData);
        if (actionName === 'game_config' && player.isAdmin) return this.updateGameConfig(player, actionData);
    }

    onPlayerConnect(player) {
        if (this.players.length === 1) {
            player.isAdmin = true;
        }
        if (this.deckConfig.totalHands !== this.players.length) {
            this.deckConfig.totalHands = this.players.length;
            this.emitGameConfig();
        }
    }

    requestPartner(player, clientId) {
        const store = this.dataStore.preferredPartners;
        if (store[player.id] && store[player.id] !== clientId) {
            delete store[player.id]; // keep requests in order
        }
        if (!this.getPlayerById(clientId)) return;
        store[player.id] = clientId;
    }

    playerReady(player, isReady) {
        if (isReady) this.readyPlayers.add(player.id);
        else this.readyPlayers.delete(player.id);
        if (this.players.length < 2) return;
        if (this.readyPlayers.size === this.players.length) this.startGame();
    }

    grantAdmin(clientId) {
        const player = this.getPlayerById(clientId);
        if (!player) return;
        player.isAdmin = true;
        // this.emitPlayers(); // todo this should move into the game (game:kick, game:admin)
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

    startGame() {
        if (this.dataStore.gameInProgress) return this.complete();

        this.resetPlayerPositionsAndPartners();
        if (!(this.players.length % 2) && 4 <= this.players.length && this.players.length <= 10) {
            this.matchPartners(this.dataStore.preferredPartners);
        }
        this.setPlayerPositions();
        this.dataStore.gameInProgress = true;
        this.complete();
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

    emitGameConfig() {
        this.emitStageMessage('config', this.deckConfig);
    }
}
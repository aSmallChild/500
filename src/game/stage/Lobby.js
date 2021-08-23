import GameStage from '../GameStage.js';

export default class Lobby extends GameStage {
    start(dataFromPreviousStage) {
        this.isNewGame = !dataFromPreviousStage;
        if (!this.isNewGame) return this.complete();

        if (!this.dataStore.preferredPartners) {
            this.dataStore.preferredPartners = {};
        }
        this.readyPlayers = new Set();
    }

    onPlayerAction(player, socket, actionName, actionData) {
        if (actionName === 'partner') return this.requestPartner(player, actionData);
        if (actionName === 'ready') return this.playerReady(player, true);
        if (actionName === 'not_ready') return this.playerReady(player, false);
        if (actionName === 'start_game' && player.isAdmin) return this.startGame();
        if (actionName === 'give_admin' && player.isAdmin) return this.grantAdmin(actionData);
    }

    onPlayerConnect(player) {
        if (this.players.length === 1) {
            player.isAdmin = true;
        }
    }

    requestPartner(player, partnerName) {
        const store = this.dataStore.preferredPartners;
        if (store[player.name] && store[player.name] !== partnerName) {
            delete store[player.name]; // keep requests in order
        }
        if (!this.getPlayerByName(partnerName)) return;
        store[player.name] = partnerName;
    }

    playerReady(player, isReady) {
        if (isReady) this.readyPlayers.add(player.name);
        else this.readyPlayers.delete(player.name);
        if (this.players.length < 2) return;
        if (this.readyPlayers.size === this.players.length) this.startGame();
    }

    grantAdmin(name) {
        const player = this.getPlayerByName(name);
        if (player) player.isAdmin = true;
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
        if (!this.isNewGame) return this.complete();

        this.resetPlayerPositionsAndPartners();
        if (!(this.players.length % 2) && 4 <= this.players.length && this.players.length <= 10) {
            this.matchPartners(this.dataStore.preferredPartners);
        }
        this.setPlayerPositions();

        this.complete();
    }

    matchPartners(outgoingRequests) {
        if (this.players.length % 2) {
            throw new Error(`Attempted to pair up an odd number of players.`);
        }
        const incomingRequestsPerPlayer = {};
        for (const playerName of Object.keys(outgoingRequests)) {
            const partnerName = outgoingRequests[playerName];
            if (!incomingRequestsPerPlayer[partnerName]) incomingRequestsPerPlayer[partnerName] = new Set();
            incomingRequestsPerPlayer[partnerName].add(playerName);
        }

        for (const player of this.players) {
            if (player.partner) continue;

            const incomingRequests = incomingRequestsPerPlayer[player.name] || new Set();
            let partner = this.getPlayerByName(outgoingRequests[player.name]);

            // can't be your own partner
            if (partner === player) partner = null;

            // they want each other
            if (partner && incomingRequests.has(partner.name)) {
                player.setPartner(partner);
                continue;
            }

            // nobody else wanted this player as their partner
            if (partner && !partner.partner && !incomingRequestsPerPlayer[partner.name]) {
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
                if (!incomingRequests.has(partner.name) && incomingRequests.has(otherPlayer.name)) {
                    partner = otherPlayer;
                }
            }

            player.setPartner(partner);
        }
    }
}
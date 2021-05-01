export default class Lobby extends GameStage {
    start(dataFromPreviousStage) {
        this.isNewGame = !!dataFromPreviousStage;
        if (!this.isNewGame) return this.complete();

        if (!this.dataStore.preferredPartners) {
            this.dataStore.preferredPartners = {};
        }
        this.readyPlayers = new Set();
    }

    onPlayerAction(player, actionName, actionData) {
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

    onSpectatorConnect(spectator) {}

    requestPartner(player, partnerName) {
        this.dataStore.preferredPartners[player.name] = partnerName;
    }

    playerReady(player, isReady) {
        if (isReady) this.readyPlayers.add(player.name);
        else this.readyPlayers.delete(player.name);

        if (this.readyPlayers.size === this.players.length) this.startGame();
    }

    grantAdmin(name) {
        const player = this.getPlayerByName(name);
        if (player) player.isAdmin = true;
    }

    startGame() {
        if (!this.isNewGame) return;

        if (this.players.length === 4 || this.players.length === 6) {
            this.matchPartners(this.dataStore.preferredPartners);
        }
        else {
            for (let i = 0; i < players.length; i++) {
                player.partner = null;
                player.position = i;
            }
        }

        this.complete();
    }

    matchPartners(eachPlayersRequest) {
        const willingPartnersFor = {};
        for (const playerName of Object.keys(eachPlayersRequest)) {
            const partnerName = eachPlayersRequest[playerName];
            if (!willingPartnersFor[partnerName]) willingPartnersFor[partnerName] = [];
            willingPartnersFor[partnerName].push(playerName);
        }

        for (const playerName of Object.keys(willingPartnersFor)) {
            const incomingRequests = willingPartnersFor[playerName];
            if (incomingRequests.length === 1) {
                if (!willingPartnersFor[playerName] || incomingRequests[0] === partnerRequests[playerName]) {
                    const a = this.getPlayerByName(playerName);
                    const b = this.getPlayerByName(incomingRequests[0]);
                    a.partner = b;
                    b.partner = a;
                }
            }
        }
    }
}
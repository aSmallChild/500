import GameStage from '../model/GameStage.js';
import OrdinaryNormalDeck from '../constants/OrdinaryNormalDeck.js';
import Deck from '../model/Deck.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';

export default class Bidding extends GameStage {
    start(dataFromPreviousStage) {
        // this.config = new DeckConfig(dataFromPreviousStage.config);
        // this.hands = dataFromPreviousStage.hands.map(hand => Deck.fromString(hand, this.config));
        // this.kitty = Deck.fromString(dataFromPreviousStage.kitty, this.config);
        this.dataStore.firstBidder = typeof this.dataStore.firstBidder === 'undefined' ? 0 : (this.dataStore.firstBidder + 1) % this.players.length;
        const config = OrdinaryNormalDeck.getConfig();
        config.kittySize = 3;
        config.cardsPerPlayer = 10;
        config.totalHands = this.players.length;
        this.config = new DeckConfig(config);
        this.possibleBids = Bid.getAvondaleBids(this.config);
        this.resetBids();
    }

    onPlayerAction(player, actionName, actionData) {
        if (actionName === 'bid') return this.onBid(player, actionData);
        if (actionName === 'take_kitty') return this.onTakeKitty(player, actionData);
    }

    onPlayerConnect(player) {
        this.onSpectatorConnect(player);
        player.emit('hand', this.hands[player.position]);
    }

    onSpectatorConnect(spectator) {
        spectator.emit('deck_config', this.config);
        spectator.emit('possible_bids', this.possibleBids);
        spectator.emit('bids', this.bids);
        spectator.emit('current_bidder', this.currentBidder);
        spectator.emit('highest_bid', this.highestBid);
    }

    deal(config) {
        const deck = Deck.buildDeck(config);
        deck.shuffle();
        const kitty = deck.deal(config.kittySize);
        const hands = [];
        for (const player of this.players) {
            const hand = deck.deal(config.cardsPerPlayer);
            hands.push(hand);
            player.emit('hand', player);
        }
        return {hands, kitty};
    }

    resetBids() {
        this.playerBids = this.players.map(() => []);
        this.highestBid = null;
        this.highestBidder = null;
        this.currentBidder = this.dataStore.firstBidder;
        this.playerRaisedOwnBid = null;
        this.handsDealt = this.deal(this.config);
        this.onSpectatorConnect(this.clients);
    }

    onBid(player, bid) {
        bid = Bid.fromString(bid, this.config);
        if (this.currentBidder !== player.position) return player.emit('bid_error', 'It is not your turn to bid.');
        if (bid.special === 'P') {
            if (player === this.highestBidder) return player.emit('bid_error', 'Cannot pass when you are the highest bidder.');
            return this.recordBid(player, bid);
        }

        if (this.highestBid && this.highestBid.points >= bid.points) return player.emit('bid_error', 'Bid must be higher than the leading bid.');

        this.setHighestBid(player, bid);
    }

    setHighestBid(player, bid) {
        if (this.highestBidder === player) {
            this.highestBidderRaisedOwnBid = true;
        }
        this.highestBid = bid;
        this.highestBidder = player;
        this.recordBid(player, bid);
    }

    recordBid(player, bid) {
        this.playerBids[player.position].push(bid);
        this.clients.emit('bid', {player, bid});
        this.nextBidder();
    }

    nextBidder() {
        const pass = this.config.getSpecialBid('P');
        for (const _ of this.players) {
            this.currentBidder = (this.currentBidder + 1) % this.players.length;
            const bids = this.playerBids[this.currentBidder];
            if (bids.length && bids[bids.length - 1].special === 'P' && !this.highestBidderRaisedOwnBid) {
                bids.push(pass);
                this.clients.emit('bid', {player, bid: pass})
                continue;
            }
            return this.clients.emit('current_bidder', this.currentBidder);
        }
        if (!this.highestBid) this.resetBids(); // no next bidder, everyone has passed
    }

    onTakeKitty(player) {
        const bids = this.playerBids[player.position];
        if (!bids.length || bids[bids.length - 1] !== this.highestBid) {
            return player.emit('kitty_error', 'Only the player with the leading bid can take the kitty.');
        }
        for (const otherPlayer of this.players) {
            if (otherPlayer === player) continue;
            const bids = this.playerBids[otherPlayer.position];
            if (!bids.length || bids[bids.length - 1].special !== 'P') return player.emit('kitty_error', 'Not all other players have passed.');
        }
        this.complete({
            kitty: this.kitty,
            hands: this.hands,
            winningBid: this.highestBid,
            winningBidder: this.highestBidder.position
        });
    }
}
import GameStage from '../GameStage.js';
import OrdinaryNormalDeck from '../model/OrdinaryNormalDeck.js';
import Deck from '../model/Deck.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';
import { GameAction } from '../GameAction.js';

export default class Bidding extends GameStage {
    start() {
        // this.config = new DeckConfig(dataFromPreviousStage.config);
        // this.hands = dataFromPreviousStage.hands.map(hand => Deck.fromString(hand, this.config));
        // this.kitty = Deck.fromString(dataFromPreviousStage.kitty, this.config);
        this.firstBidder = typeof this.dataStore.firstBidder === 'undefined' ? 0 : this.dataStore.firstBidder;
        this.dataStore.firstBidder = (this.firstBidder + 1) % this.players.length;
        const config = OrdinaryNormalDeck.config; // todo this needs to be set in the lobby
        config.kittySize = 3;
        config.cardsPerHand = 10;
        config.totalHands = this.players.length;
        this.playersThatHaveLookedAtTheirCards = new Set();
        this.config = new DeckConfig(config);
        this.possibleBids = Bid.getAvondaleBids(this.config);
        this.resetBids();
    }

    onPlayerAction(player, actionName, actionData) {
        if (actionName === GameAction.PLACE_BID) return this.onBid(player, actionData);
        if (actionName === GameAction.TAKE_HAND) return this.onTakeHand(player, actionData);
        if (actionName === GameAction.TAKE_KITTY) return this.onTakeKitty(player, actionData);
    }

    onPlayerConnect(player) {
        this.onSpectatorConnect(player);
        if (this.playersThatHaveLookedAtTheirCards.has(player)) {
            this.onTakeHand(player);
        }
    }

    onSpectatorConnect(spectator) {
        spectator.emit('deck_config', this.config);
        spectator.emit('possible_bids', this.possibleBids); // todo needs to be scoring type
        spectator.emit('bids', this.bids);
        spectator.emit('current_bidder', this.currentBidder);
        spectator.emit('highest_bid', this.highestBid);
    }

    deal(config) {
        const deck = Deck.buildDeck(config);
        deck.shuffle();
        const kitty = deck.deal(config.kittySize);
        const hands = this.players.map(() => deck.deal(config.cardsPerHand));
        return {hands, kitty};
    }

    resetBids() {
        this.playerBids = this.players.map(() => []);
        this.highestBid = null;
        this.highestBidder = null;
        this.currentBidder = this.firstBidder;
        this.highestBidderRaisedOwnBid = null;
        this.handsDealt = this.deal(this.config);
        this.playersThatHaveLookedAtTheirCards.clear();
        this.onSpectatorConnect(this.clients);
    }

    getBid(call) {
        for (const possibleBid of this.possibleBids) {
            if (possibleBid.call === call) {
                return possibleBid;
            }
        }
        return null;
    }

    onBid(player, call) {
        if (this.currentBidder !== player.position) return player.emit('bid_error', 'It is not your turn to bid.');

        const bid = this.getBid(call);
        if (!bid) return player.emit('bid_error', 'Invalid bid.');

        if (bid.special === 'P') {
            if (player === this.highestBidder) return player.emit('bid_error', 'Cannot pass when you are the highest bidder.');
            return this.recordBid(player, bid);
        }

        if (bid.special === 'B' && this.playersThatHaveLookedAtTheirCards.has(player)) {
            return player.emit('bid_error', `You can only call ${bid.getName()} before looking at your hand.`);
        }

        if (this.highestBid && this.highestBid.points >= bid.points) return player.emit('bid_error', 'Bid must be higher than the leading bid.');

        this.setHighestBid(player, bid);
    }

    setHighestBid(player, bid) {
        this.highestBidderRaisedOwnBid = this.highestBidder === player;
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
        const pass = this.getBid('P');
        for (let i = 0; i < this.players.length; i++) {
            this.currentBidder = (this.currentBidder + 1) % this.players.length;
            const bids = this.playerBids[this.currentBidder];
            if (bids.length && bids[bids.length - 1].special === 'P' && !this.highestBidderRaisedOwnBid) {
                const player = this.players[this.currentBidder];
                bids.push(pass);
                this.clients.emit('bid', {player, bid: pass});
                continue;
            }
            return this.clients.emit('current_bidder', this.currentBidder);
        }
        if (!this.highestBid) this.resetBids(); // no next bidder, everyone has passed
    }

    onTakeHand(player) {
        player.emit('hand', this.hands[player.position]);
        this.playersThatHaveLookedAtTheirCards.add(player);
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
            winningBidder: this.highestBidder.position,
        });
    }
}
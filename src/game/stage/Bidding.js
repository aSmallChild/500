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

    onPlayerAction(player, socket, actionName, actionData) {
        if (actionName === GameAction.PLACE_BID) return this.onBid(player, socket, actionData);
        if (actionName === GameAction.TAKE_HAND) return this.onTakeHand(player);
        if (actionName === GameAction.TAKE_KITTY) return this.onTakeKitty(player, socket, actionData);
    }

    onPlayerConnect(player, socket) {
        if (this.playersThatHaveLookedAtTheirCards.has(player)) {
            this.onTakeHand(player, socket);
        }
    }

    onObserver(observer) {
        this.emitStageMessage('deck_config', this.config, observer);
        this.emitStageMessage('possible_bids', this.possibleBids, observer); // todo needs to be scoring type
        this.emitStageMessage('bids', this.bids, observer);
        this.emitStageMessage('current_bidder', this.currentBidder, observer);
        this.emitStageMessage('highest_bid', this.highestBid, observer);
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
        this.onObserver(this.channel);
    }

    getBid(call) {
        for (const possibleBid of this.possibleBids) {
            if (possibleBid.call === call) {
                return possibleBid;
            }
        }
        return null;
    }

    onBid(player, socket, call) {
        if (this.currentBidder !== player.position) return this.emitStageMessage('bid_error', 'It is not your turn to bid.', socket);

        const bid = this.getBid(call);
        if (!bid) return this.emitStageMessage('bid_error', 'Invalid bid.', socket);

        if (bid.special === 'P') {
            if (player === this.highestBidder) return this.emitStageMessage('bid_error', 'Cannot pass when you are the highest bidder.', socket);
            return this.recordBid(player, bid);
        }

        if (bid.special === 'B' && this.playersThatHaveLookedAtTheirCards.has(player)) {
            return this.emitStageMessage('bid_error', `You can only call ${bid.getName()} before looking at your hand.`, socket);
        }

        if (this.highestBid && this.highestBid.points >= bid.points) return this.emitStageMessage('bid_error', 'Bid must be higher than the leading bid.', socket);

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
        this.emitStageMessage(GameAction.PLACE_BID, {player, bid});
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
                this.emitStageMessage(GameAction.PLACE_BID, {player, bid: pass});
                continue;
            }
            return this.emitStageMessage('current_bidder', this.currentBidder);
        }
        if (!this.highestBid) this.resetBids(); // no next bidder, everyone has passed
    }

    onTakeHand(player, socket = null) {
        socket = socket || player;
        this.emitStageMessage('hand', this.hands[player.position], socket);
        this.playersThatHaveLookedAtTheirCards.add(player);
    }

    onTakeKitty(player, socket) {
        const bids = this.playerBids[player.position];
        if (!bids.length || bids[bids.length - 1] !== this.highestBid) {
            return this.emitStageMessage('kitty_error', 'Only the player with the leading bid can take the kitty.', socket);
        }
        for (const otherPlayer of this.players) {
            if (otherPlayer === player) continue;
            const bids = this.playerBids[otherPlayer.position];
            if (!bids.length || bids[bids.length - 1].special !== 'P') {
                this.emitStageMessage('kitty_error', 'Not all other players have passed.', socket);
                return;
            }
        }
        this.complete({
            kitty: this.kitty,
            hands: this.hands,
            winningBid: this.highestBid,
            winningBidder: this.highestBidder.position,
        });
    }
}
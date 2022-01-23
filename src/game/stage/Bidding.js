import GameStage from '../GameStage.js';
import Deck from '../model/Deck.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';
import {GameAction} from '../GameAction.js';
import ScoringAvondale from '../model/ScoringAvondale.js';

export default class Bidding extends GameStage {
    start(dataFromPreviousStage) {
        this.firstBidder = typeof this.dataStore.firstBidder === 'undefined' ? 0 : this.dataStore.firstBidder;
        this.dataStore.firstBidder = (this.firstBidder + 1) % this.players.length;
        this.playersThatHaveLookedAtTheirCards = new Set();
        this.config = new DeckConfig(dataFromPreviousStage.deckConfig);
        this.scoring = new ScoringAvondale(this.config);
        this.specialBids = this.scoring.getSpecialBids();
        this.resetBids();
    }

    onStageAction(player, actionName, actionData) {
        if (actionName === GameAction.PLACE_BID) return this.onBid(player, actionData);
        if (actionName === GameAction.TAKE_HAND) return this.onTakeHand(player);
        if (actionName === GameAction.TAKE_KITTY) return this.onTakeKitty(player, actionData);
    }

    onPlayerConnect(player, socket) {
        this.onObserver(socket);
        if (this.hasPlayerSeenHand(player)) {
            this.emitPlayerHand(player, socket);
        }
    }

    onObserver(observer) {
        this.emitStageMessage('deck_config', this.config, observer);
        this.emitStageMessage('bids', this.playerBids, observer);
        this.emitStageMessage('current_bidder', this.currentBidder, observer);
        this.emitPlayersThatHaveSeenTheirHands(observer);
        this.emitHighestBid(observer);
    }

    deal(config) {
        const deck = Deck.buildDeck(config);
        deck.shuffle();
        const kitty = deck.deal(config.kittySize);
        const hands = this.players.map(() => deck.deal(config.cardsPerHand));
        return [hands, kitty];
    }

    resetBids() {
        this.playerBids = this.players.map(() => []);
        this.highestBid = null;
        this.highestBidder = null;
        this.currentBidder = this.firstBidder;
        this.highestBidderRaisedOwnBid = null;
        [this.hands, this.kitty] = this.deal(this.config);
        this.playersThatHaveLookedAtTheirCards.clear();
        this.onObserver(this.channel);
    }

    getBid(serializedBid) {
        return Bid.fromString(serializedBid, this.config);
    }

    validateBid(player, bid) {
        if (bid.special && !this.scoring.isValidSpecialBid(bid)) {
            this.emitStageMessage('bid_error', 'Invalid special bid.', player);
            return false;
        }

        if (bid.trumps) {
            if (!this.scoring.canHaveTrumps(bid)) {
                this.emitStageMessage('bid_error', 'Trumps not allowed with this bid.', player);
                return false;
            }
        }

        if (bid.antiTrumps && !this.scoring.canHaveAntiTrumps(bid, bid.antiTrumps)) {
            this.emitStageMessage('bid_error', 'Anti-trump suit cannot be the same as trumps.', player);
            return false;
        }

        if (bid.tricks && !this.scoring.isValidTricks(bid.tricks)) {
            this.emitStageMessage('bid_error', `Bid must be between ${this.scoring.minTricks} and ${this.scoring.maxTricks} tricks.`, player);
            return false;
        }

        return true;
    }

    getPointsForBid(bid) {
        if (bid.special) {
            return this.scoring.getSpecialBid(bid.special).points;
        }

        return this.scoring.calculateStandardBidPoints(bid.tricks, bid.trumps, bid.antiTrumps);
    }

    onBid(player, serializedBid) {
        if (this.currentBidder !== player.position) return this.emitStageMessage('bid_error', 'It is not your turn to bid.', player);

        const bid = this.getBid(serializedBid);
        if (!this.validateBid(player, bid)) return;

        bid.points = this.getPointsForBid(bid);

        if (bid.special === 'P') {
            if (player === this.highestBidder) return this.emitStageMessage('bid_error', 'Cannot pass when you are the highest bidder.', player);
            return this.recordBid(player, bid);
        }

        if (bid.special === 'B' && this.hasPlayerSeenHand(player)) {
            return this.emitStageMessage('bid_error', `You can only call ${bid.getName()} before looking at your hand.`, player);
        }

        if (this.highestBid && this.highestBid.points >= bid.points) return this.emitStageMessage('bid_error', 'Bid must be higher than the leading bid.', player);

        this.setHighestBid(player, bid);
    }

    setHighestBid(player, bid) {
        this.highestBidderRaisedOwnBid = this.highestBidder === player;
        this.highestBid = bid;
        this.highestBidder = player;
        this.emitHighestBid();
        this.recordBid(player, bid);
    }

    emitHighestBid(observer) {
        this.emitStageMessage('highest_bid', {position: this.highestBidder?.position, bid: this.highestBid}, observer);
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
        this.playersThatHaveLookedAtTheirCards.add(player.position);
        this.emitPlayerHand(player, socket);
        this.emitPlayersThatHaveSeenTheirHands();
    }

    emitPlayerHand(player, socket = null) {
        socket = socket || player;
        this.emitStageMessage(GameAction.TAKE_HAND, this.hands[player.position], socket);
    }

    hasPlayerSeenHand(player) {
        return this.playersThatHaveLookedAtTheirCards.has(player.position);
    }

    emitPlayersThatHaveSeenTheirHands(socket = null) {
        this.emitStageMessage(GameAction.PLAYERS_TAKEN_HANDS, Array.from(this.playersThatHaveLookedAtTheirCards), socket);
    }

    onTakeKitty(player) {
        const bids = this.playerBids[player.position];
        if (!bids.length || bids[bids.length - 1] !== this.highestBid) {
            return this.emitStageMessage('kitty_error', 'Only the player with the leading bid can take the kitty.', player);
        }
        for (const otherPlayer of this.players) {
            if (otherPlayer === player) continue;
            const bids = this.playerBids[otherPlayer.position];
            if (!bids.length || bids[bids.length - 1].special !== 'P') {
                return this.emitStageMessage('kitty_error', 'Not all other players have passed.', player);
            }
        }
        this.complete({
            deckConfig: this.config,
            kitty: this.kitty,
            hands: this.hands,
            winningBid: this.highestBid,
            winningBidderPosition: this.highestBidder.position,
        });
    }
}
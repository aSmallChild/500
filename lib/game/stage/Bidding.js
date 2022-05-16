import GameStage from '../GameStage.js';
import {buildDeck, shuffle, deal} from '../Deck.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';
import {GameAction} from '../GameAction.js';
import ScoringAvondale from '../model/ScoringAvondale.js';

export default class Bidding extends GameStage {
    start(dataFromPreviousStage) {
        this.firstBidderPosition = this.dataStore?.firstBidderPosition ?? 0;
        this.dataStore.firstBidderPosition = (this.firstBidderPosition + 1) % this.players.length;
        this.playersThatHaveLookedAtTheirCards = new Set();
        this.config = new DeckConfig(dataFromPreviousStage.deckConfig);
        this.scoring = new ScoringAvondale(this.config);
        this.specialBids = this.scoring.getSpecialBids();
        this.resetBids(false);
    }

    onStageAction(player, socket, actionName, actionData) {
        if (actionName === GameAction.PLACE_BID) return this.onBid(player, socket, actionData);
        if (actionName === GameAction.TAKE_HAND) return this.onTakeHand(player, null);
        if (actionName === GameAction.TAKE_KITTY) return this.onTakeKitty(player, socket);
    }

    onPlayerConnect(player, socket) {
        this.onObserverConnect(socket);
        if (this.hasPlayerSeenHand(player)) {
            this.emitPlayerHand(player, socket);
        }
    }

    onObserverConnect(observer) {
        this.emitStageMessage('deck_config', this.config, observer);
        this.emitStageMessage('bids', this.playerBids, observer);
        this.emitStageMessage('current_bidder', this.currentBidderPosition, observer);
        this.emitPlayersThatHaveSeenTheirHands(observer);
        this.emitHighestBid(observer);
    }

    deal(config) {
        const cards = buildDeck(config);
        shuffle(cards);
        const kitty = deal(cards, config.kittySize);
        const hands = this.players.map(() => deal(cards, config.cardsPerHand));
        return [hands, kitty];
    }

    resetBids(emit = false) {
        this.playerBids = this.players.map(() => []);
        this.highestBid = null;
        this.highestBidder = null;
        this.currentBidderPosition = this.firstBidderPosition;
        this.highestBidderRaisedOwnBid = null;
        [this.hands, this.kitty] = this.deal(this.config);
        if (emit) {
            this.onObserverConnect();
            for (const position of this.playersThatHaveLookedAtTheirCards) {
                this.emitPlayerHand(this.players[position]);
            }
        }
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

    onBid(player, socket, serializedBid) {
        if (this.currentBidderPosition !== player.position) {
            return this.emitStageMessage('bid_error', 'It is not your turn to bid.', socket);
        }

        const bid = this.getBid(serializedBid);
        if (!this.validateBid(player, bid)) return;

        bid.points = this.getPointsForBid(bid);

        if (bid.special === 'P') {
            if (player === this.highestBidder) {
                return this.emitStageMessage('bid_error', 'Cannot pass when you are the highest bidder.', socket);
            }
            return this.recordBid(player, bid);
        }

        if (bid.special === 'B' && this.hasPlayerSeenHand(player)) {
            return this.emitStageMessage('bid_error', `You can only call ${bid.getName()} before looking at your hand.`, socket);
        }

        if (this.highestBid && this.highestBid.points >= bid.points) {
            return this.emitStageMessage('bid_error', 'Bid must be higher than the leading bid.', socket);
        }

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
            this.currentBidderPosition = (this.currentBidderPosition + 1) % this.players.length;
            const bids = this.playerBids[this.currentBidderPosition];
            if (bids.length && bids[bids.length - 1].special === 'P' && !this.highestBidderRaisedOwnBid) {
                const player = this.players[this.currentBidderPosition];
                bids.push(pass);
                this.emitStageMessage(GameAction.PLACE_BID, {player, bid: pass});
                continue;
            }
            return this.emitStageMessage('current_bidder', this.currentBidderPosition);
        }
        if (!this.highestBid) this.resetBids(true); // no next bidder, everyone has passed
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

    onTakeKitty(player, socket) {
        const bids = this.playerBids[player.position];
        if (!bids.length || bids[bids.length - 1] !== this.highestBid) {
            return this.emitStageMessage('kitty_error', 'Only the player with the leading bid can take the kitty.', socket);
        }
        for (const otherPlayer of this.players) {
            if (otherPlayer === player) continue;
            const bids = this.playerBids[otherPlayer.position];
            if (!bids.length || bids[bids.length - 1].special !== 'P') {
                return this.emitStageMessage('kitty_error', 'Not all other players have passed.', socket);
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
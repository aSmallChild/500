import Bid from './Bid.js';

export default class ScoringAvondale {
    constructor(config) {
        this.config = config;
        this.pointsIncrement = 20;
        this.startingBidPoints = 40;
        this.specialBids = Bid.buildSpecialBids(this.config);
    }

    getSpecialBids() {
        return this.specialBids;
    }

    get minTricks() {
        return Math.floor(this.config.cardsPerHand / 2) + 1;
    }

    get maxTricks() {
        return this.config.cardsPerHand;
    }

    get maxStandardBidPoints() {
        return this.calculateStandardBidPoints(this.maxTricks, null, null);
    }

    canHaveTrumps(bid) {
        return !bid.special;
    }

    canHaveAntiTrumps(bid, suit = null) {
        if (bid.special) return false;
        return bid.trumps != suit;
    }

    isValidSpecialBid(bid) {
        if (!bid.special) return false;
        return this.getSpecialBid(bid.special) !== null;
    }

    getSpecialBid(symbol) {
        return this.specialBids.find(b => b.special == symbol);
    }

    isValidTricks(tricks) {
        return this.minTricks <= tricks && tricks <= this.maxTricks;
    }

    calculateStandardBidPoints(tricks, trumps, antiTrumps) {
        const suits = this.config.suits;
        const trickIncrement = (suits.length + 1) * this.pointsIncrement;
        const index = suits.getSuitIndex(trumps);
        const suitValue = index < 0 ? suits.length : suits.length - 1 - index;
        const antiTrumpsPoints = antiTrumps ? -5 : 0;
        return trickIncrement * (tricks - this.minTricks) + suitValue * this.pointsIncrement + this.startingBidPoints + antiTrumpsPoints;
    }
}

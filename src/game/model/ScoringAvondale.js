import Bid from './Bid.js';

export default class ScoringAvondale {
    constructor(config) {
        this.config = config;
        this.pointsIncrement = 20;
        this.startingBidPoints = 40;
    }

    getSpecialBids() {
        return Bid.buildSpecialBids(this.config.specialBids, this.config);
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
        return !!bid.special;
    }

    canHaveAntiTrumps(bid, suit = null) {
        if (bid.special) {
            return false;
        }

        if (suit) {
            return bid.trumps !== suit;
        }

        return true;
    }

    isValid(bid) {
        if (bid.trumps && !this.canHaveTrumps(bid)) {
            return false;
        }

        if (bid.antiTrumps && !this.canHaveTrumps(bid, bid.antiTrumps)) {
            return false;
        }

        if (bid.tricks && (bid.tricks < this.minTricks || this.maxTricks < bid.tricks)) {
            return false;
        }

        if (bid.special && (bid.trumps || bid.antiTrumps)) {
            return false;
        }

        // todo need serverside validation for bids, that matches how the bid selector renders things
        return true;
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

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

    canHaveAntiTrumps(bid) {
        return !!bid.special;
    }

    calculateStandardBidPoints(tricks, trumps, antiTrumps) {
        const suits = this.config.suits;
        const trickIncrement = (suits.length + 1) * this.pointsIncrement;
        const index = suits.lowToHigh.indexOf(trumps);
        const suitValue = index < 0 ? suits.length : index;
        const antiTrumpsPoints = antiTrumps ? -5 : 0;
        return trickIncrement * (tricks - this.minTricks) + suitValue * this.pointsIncrement + this.startingBidPoints + antiTrumpsPoints;
    }
}

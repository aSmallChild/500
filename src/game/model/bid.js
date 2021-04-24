import Suit from './suit.js';

export default class Bid {
    static SPECIAL_BIDS = {
        M: {points: 250, name: 'Closed Misere'},
        O: {points: 500, name: 'Open Misere'},
        B: {points: 1000, name: 'Blind Misere'},
    };

    constructor(tricks, trumps, antiTrumps, special, points) {
        this.tricks = tricks;
        this.trumps = trumps;
        this.antiTrumps = antiTrumps;
        this.special = special;
        this.points = points;
    }

    getName() {
        if (this.special) return Bid.SPECIAL_BIDS[this.special].name;
        const words = [this.tricks];
        if (this.trumps) words.push(Suit.getName(this.trumps) + (this.tricks === 1 ? '' : 's'));
        if (this.antiTrumps) words.push('no ' + Suit.getName(this.antiTrumps) + 's');
        if (!this.trumps && !this.antiTrumps) words.push('no Trumps');
        return words.join(' ');
    }

    valueOf() {
        return this.toString();
    }

    toString() {
        const str = this.points + ':';
        if (this.special) return str + this.special;
        return str + this.tricks +
            (this.trumps ?? '') +
            (this.antiTrumps ? '!' + this.antiTrumps : '');
    }

    static compareBids(a, b) {
        if (a.points === b.points) return 0;
        return a.points > b.points ? 1 : -1;
    }

    static fromString(str) {
        let [points, call] = str.split(':');
        points = parseInt(points);
        if (Bid.SPECIAL_BIDS.hasOwnProperty(call)) return new Bid(null, null, null, call, points);
        const regex = /^(?<tricks>\d+)(?<trumps>[^!])?!?(?<antiTrumps>[^!])?$/g;
        let {tricks, trumps, antiTrumps} = regex.exec(call).groups;
        tricks = parseInt(tricks);
        return new Bid(tricks, trumps || null, antiTrumps || null, null, points);
    }

    static getSpecialBids(specialBids = Bid.SPECIAL_BIDS) {
        const bids = [];
        for (const x in specialBids) {
            bids.push(new Bid(null, null, null, x, specialBids[x].points));
        }
        return bids;
    }

    static getAvondaleBids(cardsPerPlayer = 10, suitsHighToLow = Suit.ALL, specialBids = Bid.SPECIAL_BIDS) {
        const minTricks = parseInt(10 / 2) + 1;
        const suits = suitsHighToLow.slice().reverse();
        const bids = Bid.getSpecialBids(specialBids);
        let points = 40;
        for (let tricks = minTricks; tricks <= cardsPerPlayer; tricks++) {
            for (const suit of suits) {
                bids.push(new Bid(tricks, suit, null, null, points));
                points += 20;
            }
            bids.push(new Bid(tricks, null, null, null, points));
            points += 20;
        }
        return bids.sort(Bid.compareBids);
    }
}


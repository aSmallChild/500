export default class Bid {
    constructor(tricks, trumps, antiTrumps, special, points, config) {
        this.tricks = tricks;
        this.trumps = trumps;
        this.antiTrumps = antiTrumps;
        this.special = special;
        this.points = points;
        this.config = config;
    }

    getName() {
        if (this.special) return this.config.getSpecialBid(this.special).name;
        const words = [this.tricks];
        if (this.trumps) words.push(this.trumps.name + (this.tricks === 1 ? '' : 's'));
        if (this.antiTrumps) words.push('no ' + this.antiTrumps.name + 's');
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
            (this.trumps?.symbol ?? '') +
            (this.antiTrumps ? '!' + this.antiTrumps.symbol : '');
    }

    static compareBids(a, b) {
        if (a.points === b.points) return 0;
        return a.points > b.points ? 1 : -1;
    }

    static fromString(str, config) {
        let [points, call] = str.split(':');
        points = parseInt(points);
        if (config.getSpecialBid(call)) return new Bid(null, null, null, call, points, config);
        const regex = /^(?<tricks>\d+)(?<trumps>[^!])?!?(?<antiTrumps>[^!])?$/g;
        let {tricks, trumps, antiTrumps} = regex.exec(call).groups;
        tricks = parseInt(tricks);
        trumps = trumps ? config.suits.getSuit(trumps) : null;
        antiTrumps = antiTrumps ? config.suits.getSuit(antiTrumps) : null;
        return new Bid(tricks, trumps || null, antiTrumps || null, null, points, config);
    }

    static buildSpecialBids(specialBids, config) {
        const bids = [];
        for (const specialBid of specialBids) {
            bids.push(new Bid(null, null, null, specialBid.symbol, specialBid.points, config));
        }
        return bids;
    }

    static getAvondaleBids(config, cardsPerPlayer = 10) {
        const minTricks = parseInt(cardsPerPlayer / 2) + 1;
        const bids = Bid.buildSpecialBids(config.specialBids);
        let points = 40;
        for (let tricks = minTricks; tricks <= cardsPerPlayer; tricks++) {
            for (const suit of config.suits.lowToHigh) {
                bids.push(new Bid(tricks, suit, null, null, points, config));
                points += 20;
            }
            bids.push(new Bid(tricks, null, null, null, points, config));
            points += 20;
        }
        return bids.sort(Bid.compareBids);
    }
}


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

    toJSON() {
        return this.toString();
    }

    get call() {
        return this.special ? this.special : this.tricks + (this.trumps?.symbol ?? '') + (this.antiTrumps ? '!' + this.antiTrumps.symbol : '');
    }

    toString() {
        return this.call + ':' + this.points;
    }

    static fromString(str, config) {
        if (str.indexOf(':') < 0) str += ':0';
        let [call, points] = str.split(':');
        points = parseInt(points);
        if (config.getSpecialBid(call)) return new Bid(null, null, null, call, points, config);
        const regex = /^(?<tricks>\d+)(?<trumps>[^!])?!?(?<antiTrumps>[^!])?$/g;
        let {tricks, trumps, antiTrumps} = regex.exec(call).groups;
        tricks = parseInt(tricks);
        if (trumps) {
            trumps = trumps ? config.suits.getSuit(trumps) : null;
            if (!trumps) throw new Error('Trump suit is invalid.');
        }
        if (antiTrumps) {
            antiTrumps = antiTrumps ? config.suits.getSuit(antiTrumps) : null;
            if (!antiTrumps) throw new Error('Anti-trump suit is invalid.');
        }
        return new Bid(tricks, trumps || null, antiTrumps || null, null, points, config);
    }

    static compareBids(a, b) {
        if (a.points === b.points) return 0;
        return a.points > b.points ? 1 : -1;
    }

    static buildSpecialBids(config) {
        const bids = [];
        for (const specialBid of config.specialBids) {
            bids.push(new Bid(0, null, null, specialBid.symbol, parseInt(specialBid.points), config));
        }
        return bids;
    }

    static getAvondaleBids(config) {
        const minTricks = parseInt(config.cardsPerHand / 2) + 1;
        const bids = this.buildSpecialBids(config);
        let points = 40;
        for (let tricks = minTricks; tricks <= config.cardsPerHand; tricks++) {
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


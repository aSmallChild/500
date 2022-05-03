import Suit from './Suit.js';

export default class SuitCollection {
    constructor(suitsHighToLow) {
        const suits = [];
        for (const suit of suitsHighToLow) {
            suits.push(typeof suit === 'string' ? Suit.fromString(suit) : suit);
        }
        this.suits = suits;
        this._symbols = [];
        for (const suit of this.suits) {
            this._symbols.push(suit.symbol);
        }
    }

    [Symbol.iterator]() { return this.suits.values(); }

    get length() {
        return this.suits.length;
    }

    get lowToHigh() {
        return this.suits.slice().reverse();
    }

    indexOf(suit) {
        return this.suits.indexOf(suit);
    }

    getSuit(symbol) {
        for (const suit of this.suits) {
            if (suit.symbol === symbol) return suit;
        }
        return null;
    }

    getSuitIndex(suit) {
        if (!suit) {
            return -1;
        }
        let i = 0;
        for (const s of this.suits) {
            if (s.symbol === suit.symbol) {
                return i;
            }
            i++;
        }
        return -1;
    }

    get symbols() {
        return this._symbols;
    }
}
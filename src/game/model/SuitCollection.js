import Suit from './Suit.js';

export default class SuitCollection {
    constructor(suitsHighToLow) {
        const suits = [];
        for (let suit of suitsHighToLow) {
            if (typeof suit === 'string') suit = Suit.fromString(suit);
            suits.push(suit);
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

    getSuit(symbol) {
        for (const suit of this.suits) {
            if (suit.symbol === symbol) return suit;
        }
        return null;
    }

    getName(symbol) {
        return this.getSuit(symbol)?.name;
    }

    get symbols() {
        return this._symbols;
    }
}
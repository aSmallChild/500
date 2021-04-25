import SuitCollection from './SuitCollection.js';

export default class DeckConfig {
    constructor(config) {
        this.config = config;
        this.suits = config.SUITS_HIGH_TO_LOW;
        this.suitPictureCards = config.SUIT_PICTURE_CARDS_HIGH_TO_LOW;
        this.specialCards = config.SPECIAL_CARDS_HIGH_TO_LOW;
        this.specialBids = config.SPECIAL_BIDS_HIGH_TO_LOW;
    }

    getCardName(value) {
        for (const x of [...this._specialCards, ...this._suitPictureCards]) {
            if (x.symbol === value) return x.name;
        }
        return value;
    }

    set suits(suits) {
        this._suits = new SuitCollection(suits);
    }

    get suits() {
        return this._suits;
    }

    get suitPictureCards() {
        return this._suitPictureCards;
    }

    set suitPictureCards(cards) {
        this._suitPictureCards = [];
        for (const str of cards) {
            const [symbol, name] = str.split(':');
            this._suitPictureCards.push({symbol, name});
        }
    }

    getSymbolIndex(array, symbol) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].symbol === symbol) return i;
        }
        return -1;
    }

    get specialCards() {
        return this._specialCards;
    }

    set specialCards(cards) {
        this._specialCards = [];
        for (const str of cards) {
            const [symbol, name] = str.split(':');
            this._specialCards.push({symbol, name});
        }
    }

    get specialBids() {
        return this._specialBids;
    }

    set specialBids(bids) {
        this._specialBids = [];
        for (const str of bids) {
            const [symbol, points, name] = str.split(':');
            this._specialBids.push({symbol, points, name});
        }
    }
}
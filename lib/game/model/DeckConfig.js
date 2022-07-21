import SuitCollection from './SuitCollection.js';

export default class DeckConfig {
    _specialCards = [];
    _suitPictureCards = [];
    _specialBids = [];
    _suits;

    constructor(config) {
        this.config = config;
        this.suits = config.SUITS_HIGH_TO_LOW;
        this.suitPictureCards = config.SUIT_PICTURE_CARDS_HIGH_TO_LOW;
        this.specialCards = config.SPECIAL_CARDS_HIGH_TO_LOW;
        this.specialBids = config.SPECIAL_BIDS_HIGH_TO_LOW;
        config.totalHands = config.totalHands ?? 4;
        config.kittySize = config.kittySize ?? 3;
        config.cardsPerHand = config.cardsPerHand ?? 10;
        config.targetScore = 500;
        config.pegLimitFraction = 0.9;
    }

    set totalHands(value) {
        this.config.totalHands = value;
    }

    get totalHands() {
        return this.config.totalHands;
    }

    set kittySize(value) {
        this.config.kittySize = value;
    }

    get kittySize() {
        return this.config.kittySize;
    }

    set targetScore(value) {
        this.config.targetScore = value;
    }

    get targetScore() {
        return this.config.targetScore;
    }

    set pegLimitFraction(value) {
        this.config.pegLimitFraction = value;
    }

    get pegLimitFraction() {
        return this.config.pegLimitFraction;
    }

    set cardsPerHand(value) {
        this.config.cardsPerHand = value;
    }

    get cardsPerHand() {
        return this.config.cardsPerHand;
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

    set suitPictureCards(cards) {
        this._suitPictureCards = [];
        for (const str of cards) {
            const [symbol, name] = str.split(':');
            this._suitPictureCards.push({symbol, name});
        }
    }

    get suitPictureCards() {
        return this._suitPictureCards;
    }

    getSymbolIndex(array, symbol) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].symbol === symbol) return i;
        }
        return -1;
    }

    set specialCards(cards) {
        this._specialCards = [];
        for (const str of cards) {
            const [symbol, name] = str.split(':');
            this._specialCards.push({symbol, name});
        }
    }

    get specialCards() {
        return this._specialCards;
    }

    getSpecialCardIndex(card) {
        return this.specialCards.findIndex(s => s.symbol == card.value);
    }

    getPictureCardIndex(card) {
        return this.suitPictureCards.findIndex(s => s.symbol == card.value);
    }

    getSpecialBid(symbol) {
        for (const bid of this.specialBids) {
            if (bid.symbol === symbol) return bid;
        }
        return null;
    }

    set specialBids(bids) {
        this._specialBids = [];
        for (const str of bids) {
            const [symbol, points, name] = str.split(':');
            this._specialBids.push({symbol, points, name});
        }
    }

    get specialBids() {
        return this._specialBids;
    }

    toJSON() {
        return this.config;
    }
}
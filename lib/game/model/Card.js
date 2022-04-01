export default class Card {
    static JACK = 'J';
    static JOKER = '$';

    constructor(suit, value, config) {
        this.suit = suit;
        if (!value) throw new Error('value missing while creating card');
        this.value = value;
        if (!config) throw new Error('DeckConfig missing while creating card');
        this.config = config;
    }

    isJack() {
        return this.value == Card.JACK;
    }

    isJoker() {
        return this.value == Card.JOKER;
    }

    getName() {
        return this.config.getCardName(this.value) + (this.suit ? ` of ${this.suit.name}s` : '')
    }

    toJSON() {
        return this.toString();
    }

    toString() {
        return (this.suit?.symbol || '') + this.value;
    }

    static fromString(str, config) {
        if (config.getSymbolIndex(config.specialCards, str) >= 0) return new Card(null, str, config);
        let [suit, ...value] = str;
        value = value.join('');
        if (!isNaN(parseInt(value))) value = parseInt(value);
        return new Card(config.suits.getSuit(suit), value, config);
    }

    valueOf() {
        return this.toString();
    }
}
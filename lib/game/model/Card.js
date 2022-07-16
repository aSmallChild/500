export default class Card {
    constructor(suit, value, config) {
        this.suit = suit;
        if (!value) throw new Error('value missing while creating card');
        this.value = value;
        if (!config) throw new Error('DeckConfig missing while creating card');
        this.config = config;
    }

    isSpecialCard() {
        if (this.isNumberCard()) {
            return false;
        }

        return this.getSpecialIndex() >= 0;
    }

    getSpecialIndex() {
        return this.config.getSpecialCardIndex(this);
    }

    isPictureCard() {
        return !this.isNumberCard() && !this.isSpecialCard();
    }

    getPictureIndex() {
        return this.config.getPictureCardIndex(this);
    }

    isNumberCard() {
        return typeof this.value == 'number';
    }

    isLowestPictureCard() {
        const index = this.getPictureIndex();
        return index == this.config.suitPictureCards.length - 1;
    }

    getName() {
        return this.config.getCardName(this.value) + (this.suit ? ` of ${this.suit.name}s` : '');
    }

    getSuitIndex() {
        return this.config.suits.indexOf(this.suit);
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
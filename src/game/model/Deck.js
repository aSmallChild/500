import Card from './Card.js';

export default class Deck {
    constructor(cards, config) {
        this.cards = cards;
        this.config = config;
    }

    [Symbol.iterator]() { return this.cards.values(); }

    get size() {
        return this.cards.length;
    }

    deal(numberOfCards) {
        numberOfCards = Math.min(this.cards.length, Math.abs(numberOfCards));
        return new Deck(this.cards.splice(this.cards.length - numberOfCards), this.config);

    }

    draw() {
        return this.cards.pop();
    }

    push(card) {
        this.cards.push(card);
    }

    shuffle() {
        for (let i = this.size - 1; i > 0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1));
            const cardToSwap = this.cards[newIndex];
            this.cards[newIndex] = this.cards[i];
            this.cards[i] = cardToSwap;
        }
    }

    toJSON() {
        return this.toString();
    }

    toString() {
        if (!this.size) return '';
        const cards = this.cards.slice();
        cards.sort((a, b) => this.compareCards(b, a));
        let str = '';
        let i = 0;
        while (!cards[i].suit) {
            str += cards[i].value;
            i++;
        }
        let previousValue;
        const consecutiveNumbers = [];
        const applyRange = () => {
            const r = consecutiveNumbers.splice(0, consecutiveNumbers.length);
            if (!r.length) return '';
            let str = typeof previousValue === 'number' ? ',' : '';
            previousValue = r[r.length - 1];
            if (r.length < 3) return str + r.join(',');
            str += r[0] + '-' + previousValue;
            return str;
        };
        for (const suit of this.config.suits) {
            let suitStr = '';
            previousValue = null;
            while (i < cards.length && cards[i].suit.symbol === suit.symbol) {
                const card = cards[i++];
                if (typeof card.value === 'number') {
                    const lastNumberInRange = consecutiveNumbers[consecutiveNumbers.length - 1];
                    if (consecutiveNumbers.length && lastNumberInRange - 1 !== card.value && lastNumberInRange + 1 !== card.value) {
                        suitStr += applyRange();
                    }
                    consecutiveNumbers.push(card.value);
                } else {
                    suitStr += card.value;
                    previousValue = card.value;
                }
            }
            if (suitStr || consecutiveNumbers.length) str += suit.symbol + suitStr + applyRange();
        }
        return str;
    }

    static fromString(str, config) {
        const cards = [];
        let suit = null, previousValue = null;
        for (let x of str.match(/(\d+|.)/g)) {
            if (config.getSymbolIndex(config.specialCards, x) >= 0) cards.push(new Card(null, x, config));
            else if (config.suits.symbols.indexOf(x) >= 0) suit = config.suits.getSuit(x);
            else if (x === '-' || x === ',') previousValue = x;
            else if (previousValue === '-') {
                let value = cards[cards.length - 1].value;
                const increment = x > value ? 1 : -1;
                for (value += increment; increment > 0 ? x >= value : x <= value; value += increment) {
                    cards.push(new Card(suit, value, config));
                }
                previousValue = value;
            } else {
                const number = parseInt(x);
                if (!isNaN(number)) x = number;
                cards.push(new Card(suit, x, config));
                previousValue = x;
            }
        }
        return new Deck(cards, config);
    }

    compareCards(a, b) {
        const specials = this.config.specialCards;
        const aSpecialIndex = this.config.getSymbolIndex(specials, a.value);
        const bSpecialIndex = this.config.getSymbolIndex(specials, b.value);
        if (aSpecialIndex >= 0 && bSpecialIndex >= 0) return bSpecialIndex - aSpecialIndex;
        if (aSpecialIndex >= 0) return 1;
        if (bSpecialIndex >= 0) return -1;

        const suits = this.config.suits;
        const aSuitIndex = suits.symbols.indexOf(a.suit.symbol);
        const bSuitIndex = suits.symbols.indexOf(b.suit.symbol);
        if (aSuitIndex < bSuitIndex) return 1;
        if (aSuitIndex > bSuitIndex) return -1;

        if (a.value === b.value) return 0; // the cards are unequal in any further case

        const pictures = this.config.suitPictureCards;
        const aPictureIndex = this.config.getSymbolIndex(pictures, a.value);
        const bPictureIndex = this.config.getSymbolIndex(pictures, b.value);
        if (aPictureIndex >= 0 && bPictureIndex < 0) return 1;
        if (bPictureIndex >= 0 && aPictureIndex < 0) return -1;
        if (aPictureIndex >= 0 && bPictureIndex >= 0) return aPictureIndex < bPictureIndex ? 1 : -1;

        // number cards
        return a.value > b.value ? 1 : -1;
    }

    static buildDeck(config) {
        const suits = config.suits;
        const totalHands = config.totalHands;
        const kittySize = config.kittySize;
        const cardsPerPlayer = config.cardsPerPlayer;
        const pictureCards = config.suitPictureCards;
        const totalCards = (totalHands < 3 ? 4 : totalHands) * cardsPerPlayer + kittySize;
        const totalNumberCards = totalCards - (pictureCards.length * suits.length + config.specialCards.length);
        const cardsPerSuit = Math.floor(totalNumberCards / suits.length);
        let unallocatedCards = totalNumberCards % suits.length;

        const cards = [];
        for (const specialCard of config.specialCards) {
            cards.push(new Card(null, specialCard.symbol, config));
        }
        for (const suit of suits) {
            const [lowest, highest] = Deck.getStartEndNumberCards(cardsPerSuit + (unallocatedCards-- > 0));
            Deck.buildSuitPictureCards(suit, pictureCards, cards, config);
            Deck.buildSuitNumberCards(suit, lowest, highest, cards, config);
        }
        return new Deck(cards, config);
    }

    static getStartEndNumberCards(numberOfNumberCards = 9) {
        let lowest = 2;
        let highest = 10;
        const target = highest - lowest + 1;
        if (numberOfNumberCards < target) lowest += target - numberOfNumberCards;
        if (numberOfNumberCards > target) highest += numberOfNumberCards - target;
        return [lowest, highest];
    }

    static buildSuitPictureCards(suit, pictureCards, cards = [], config) {
        for (const card of pictureCards) {
            cards.push(new Card(suit, card.symbol, config));
        }
        return cards;
    }

    static buildSuitNumberCards(suit, lowest, highest, cards = [], config) {
        for (let i = highest; i >= lowest; i--) {
            cards.push(new Card(suit, i, config));
        }
        return cards;
    }
}
import Card from './card.js';
import Suit from './suit.js';

export default class Deck {
    constructor(cards = Deck.buildStandardDeck(), config = null) {
        this.cards = cards;
        this.config = config;
    }

    [Symbol.iterator]() { return this.cards.values(); }

    get size() {
        return this.cards.length;
    }

    draw() {
        return this.cards.shift();
    }

    push(card) {
        this.cards.push(card);
    }

    shuffle() {
        for (let i = this.size - 1; i > 0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1));
            const oldValue = this.cards[newIndex];
            this.cards[newIndex] = this.cards[i];
            this.cards[i] = oldValue;
        }
    }

    toString() {
        if (!this.size) return '';
        const cards = this.cards.slice();
        cards.sort((a, b) => Deck.compareCards(b, a));
        let str = cards[0].value === Card.JOKER ? Card.JOKER : '';
        let i = str.length;
        let previousValue;
        const range = [];
        const applyRange = () => {
            const r = range.splice(0, range.length);
            if (!r.length) return '';
            let str = typeof previousValue === 'number' ? ',' : '';
            if (r.length < 3) return str + r.join(',');
            previousValue = r[r.length - 1];
            str += r[0] + '-' + previousValue;
            return str;
        };
        for (const suit of Suit.ALL) {
            let suitStr = '';
            previousValue = null;
            while (i < cards.length && cards[i].suit === suit) {
                const card = cards[i++];
                if (typeof card.value === 'number') {
                    if (range.length && range[range.length - 1] - 1 !== card.value && range[range.length - 1] + 1 !== card.value) {
                        suitStr += applyRange();
                    }
                    range.push(card.value);
                } else {
                    suitStr += card.value;
                    previousValue = card.value;
                }
            }
            if (suitStr || range.length) str += suit + suitStr + applyRange();
        }
        return str;
    }

    static fromString(str) {
        const cards = [];
        let suit = null, previousValue = null;
        for (let x of str.match(/(\d+|.)/g)) {
            if (x === Card.JOKER) cards.push(new Card(null, x));
            else if (Suit.ALL.indexOf(x) >= 0) suit = x;
            else if (x === '-' || x === ',') previousValue = x;
            else if (previousValue === '-') {
                let value = parseInt(cards[cards.length - 1].value);
                const increment = x > value ? 1 : -1;
                for (value += increment; increment > 0 ? x >= value : x <= value; value += increment) {
                    cards.push(new Card(suit, value));
                }
                previousValue = value;
            } else {
                const number = parseInt(x);
                if (!isNaN) x = number;
                cards.push(new Card(suit, x));
                previousValue = x;
            }
        }
        return new Deck(cards);
    }

    sort(compare) {
        Deck.sortCards(this.cards, compare || Deck.compareCards);
    }

    static compareCards(a, b) {
        if (a.value === Card.JOKER) return b.value !== Card.JOKER ? 1 : 0; // all jokers are equal
        if (b.value === Card.JOKER) return -1;

        const aSuitIndex = Suit.ALL.indexOf(a.suit);
        const bSuitIndex = Suit.ALL.indexOf(b.suit);
        if (aSuitIndex < bSuitIndex) return 1;
        if (aSuitIndex > bSuitIndex) return -1;

        if (a.value === b.value) return 0; // the cards are unequal in any further case

        // picture cards
        const aPictureIndex = Card.SUIT_PICTURE_CARDS.indexOf(a.value);
        const bPictureIndex = Card.SUIT_PICTURE_CARDS.indexOf(b.value);
        if (aPictureIndex >= 0 && bPictureIndex < 0) return 1;
        if (bPictureIndex >= 0 && aPictureIndex < 0) return -1;
        if (aPictureIndex >= 0 && bPictureIndex >= 0) return aPictureIndex < bPictureIndex ? 1 : -1;

        // number cards
        return a.value > b.value ? 1 : -1;
    }

    static buildDeck(config) {
        const totalHands = config.totalHands ?? 4;
        const totalJokers = 1;
        const kittySize = 3;
        if ((kittySize - totalJokers) % 2) throw new Error('Unsupported kitty/joker configuration (wont correctly set lowest/highest number cards)');
        const cardsPerPlayer = 10;
        const pictureCardsPerSuit = Card.SUIT_PICTURE_CARDS.length;
        const totalSuits = Suit.ALL.length;
        const totalCards = (totalHands < 3 ? 4 : totalHands) * cardsPerPlayer + kittySize;
        const totalNumberCards = totalCards - (pictureCardsPerSuit * totalSuits + totalJokers);
        const cardsPerBlackSuit = Math.floor(totalNumberCards / totalSuits);
        const cardsPerRedSuit = cardsPerBlackSuit + (totalNumberCards % totalSuits ? 1 : 0);

        const [lowestRedCard, highestRedCard] = Deck.getStartEndNumberCards(cardsPerRedSuit);
        const [lowestBlackCard, highestBlackCard] = Deck.getStartEndNumberCards(cardsPerBlackSuit);

        return new Deck([
            new Card(null, Card.JOKER),
            ...Deck.buildSuitPictureCards(Suit.HEART), ...Deck.buildSuitNumberCards(Suit.HEART, lowestRedCard, highestRedCard),
            ...Deck.buildSuitPictureCards(Suit.DIAMOND), ...Deck.buildSuitNumberCards(Suit.DIAMOND, lowestRedCard, highestRedCard),
            ...Deck.buildSuitPictureCards(Suit.CLUB), ...Deck.buildSuitNumberCards(Suit.CLUB, lowestBlackCard, highestBlackCard),
            ...Deck.buildSuitPictureCards(Suit.SPADE), ...Deck.buildSuitNumberCards(Suit.SPADE, lowestBlackCard, highestBlackCard),
        ], config);
    }

    static getStartEndNumberCards(numberOfNumberCards) {
        let lowest = 2;
        let highest = 10;
        const target = highest - lowest + 1;
        if (numberOfNumberCards < target) {
            lowest += target - numberOfNumberCards;
        }

        if (numberOfNumberCards > target) {
            highest += numberOfNumberCards - target;
        }

        return [lowest, highest];
    }

    static buildStandardDeck() {
        let cards = [];
        for (const suit of Suit.ALL) cards = [...cards, ...Deck.buildSuitPictureCards(suit), ...Deck.buildSuitNumberCards(suit)];
        cards.push(new Card(null, Card.JOKER));
        return cards;
    }

    static buildSuitPictureCards(suit) {
        const cards = [];
        for (const value of Card.SUIT_PICTURE_CARDS) {
            cards.push(new Card(suit, value));
        }
        return cards;
    }

    static buildSuitNumberCards(suit, lowest = 2, highest = 10) {
        const cards = [];
        for (let i = highest; i >= lowest; i--) {
            cards.push(new Card(suit, i));
        }
        return cards;
    }
}

export class Hand extends Deck {}
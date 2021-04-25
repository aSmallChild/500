import Card from './Card.js';
import Suit from './Suit.js';

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
        const consecutiveNumbers = [];
        const applyRange = () => {
            const r = consecutiveNumbers.splice(0, consecutiveNumbers.length);
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
            if (suitStr || consecutiveNumbers.length) str += suit + suitStr + applyRange();
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
                let value = cards[cards.length - 1].value;
                const increment = x > value ? 1 : -1;
                for (value += increment; increment > 0 ? x >= value : x <= value; value += increment) {
                    cards.push(new Card(suit, value));
                }
                previousValue = value;
            } else {
                const number = parseInt(x);
                if (!isNaN(number)) x = number;
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
        const totalJokers = config.totalJokers ?? 1;
        const kittySize = config.kittySize ?? 3;
        const cardsPerPlayer = config.cardsPerPlayer ?? 10;
        const pictureCards = config.pictureCards ?? Card.SUIT_PICTURE_CARDS;
        const suits = config.suits ?? Suit.ALL;
        const totalCards = (totalHands < 3 ? 4 : totalHands) * cardsPerPlayer + kittySize;
        const totalNumberCards = totalCards - (pictureCards.length * suits.length + totalJokers);
        const cardsPerSuit = Math.floor(totalNumberCards / suits.length);
        let unallocatedCards = totalNumberCards % suits.length;

        const cards = [new Card(null, Card.JOKER)];
        for (const suit of Suit.ALL) {
            const [lowest, highest] = Deck.getStartEndNumberCards(cardsPerSuit + (unallocatedCards-- > 0));
            Deck.buildSuitPictureCards(suit, pictureCards, cards);
            Deck.buildSuitNumberCards(suit, lowest, highest, cards);
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

    static buildStandardDeck() {
        const cards = [];
        const [lowest, highest] = Deck.getStartEndNumberCards();
        for (const suit of Suit.ALL) {
            Deck.buildSuitPictureCards(suit, Card.SUIT_PICTURE_CARDS, cards);
            Deck.buildSuitNumberCards(suit, lowest, highest, cards);
        }
        cards.push(new Card(null, Card.JOKER));
        return cards;
    }

    static buildSuitPictureCards(suit, pictureCards, cards = []) {
        for (const value of pictureCards) {
            cards.push(new Card(suit, value));
        }
        return cards;
    }

    static buildSuitNumberCards(suit, lowest, highest, cards = []) {
        for (let i = highest; i >= lowest; i--) {
            cards.push(new Card(suit, i));
        }
        return cards;
    }
}

export class Hand extends Deck {}
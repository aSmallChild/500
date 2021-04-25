export default class Card {
    static JOKER = '$';
    static ACE = 'A';
    static KING = 'K';
    static QUEEN = 'Q';
    static JACK = 'J';
    static SUIT_PICTURE_CARDS = [Card.ACE, Card.KING, Card.QUEEN, Card.JACK];

    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    isPictureCard() {
        return this.value === Card.JOKER || Card.SUIT_PICTURE_CARDS.indexOf(this.value) >= 0;
    }

    static getValueName(value) {
        if (value === Card.ACE) return 'Ace';
        else if (value === Card.KING) return 'King';
        else if (value === Card.QUEEN) return 'Queen';
        else if (value === Card.JACK) return 'Jack';
        else if (value === Card.JOKER) return 'Joker';
        else return value;
    }

    getName() {
        if (this.suit) {
            return `${Card.getValueName(this.value)} of ${this.suit.name}s`;
        }

        return Card.getValueName(this.value);
    }

    toString() {
        return (this.suit?.symbol || '') + this.value;
    }

    static fromString(str, suits) {
        if (str === Card.JOKER) return new Card(null, Card.JOKER);
        let [suit, ...value] = str;
        value = value.join('');
        if (!isNaN(parseInt(value))) value = parseInt(value);
        return new Card(suits.getSuit(suit), value);
    }

    valueOf() {
        return this.toString();
    }
}
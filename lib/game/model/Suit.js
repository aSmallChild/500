export default class Suit {
    static RED = 'red';
    static BLACK = 'black';
    static NO_TRUMPS = 'no_trumps';

    constructor(symbol, color, name) {
        this.symbol = symbol;
        this.color = color;
        this.name = name;
    }

    isRed() {
        return this.color == Suit.RED;
    }

    isBlack() {
        return this.color == Suit.BLACK;
    }

    valueOf() {
        return this.toString();
    }

    toString() {
        return [this.symbol, this.color, this.name].join(':');
    }

    static fromString(str) {
        const [symbol, color, name] = str.split(':');
        return new Suit(symbol, color, name);
    }
}
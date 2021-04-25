export default class Suit {
    constructor(symbol, name) {
        this.symbol = symbol;
        this.name = name;
    }

    valueOf() {
        return this.toString();
    }

    toString() {
        return this.symbol + ':' + this.name;
    }

    static fromString(str) {
        const [symbol, name] = str.split(':');
        return new Suit(symbol, name);
    }
}
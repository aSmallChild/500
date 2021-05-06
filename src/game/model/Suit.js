export default class Suit {
    constructor(symbol, color, name) {
        this.symbol = symbol;
        this.color = color;
        this.name = name;
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
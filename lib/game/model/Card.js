export default class Card {

  #value;
  #id;

  constructor(suit, value, config) {
    this.#id = null;
    this.suit = suit;
    this.value = value;
    if (!config) throw new Error('DeckConfig missing while creating card');
    this.config = config;
  }

  set id(newValue) {
    if (newValue === null || newValue === undefined) {
      this.#id = null;
      return;
    }
    this.#id = newValue + '';
  }

  get id() {
    return this.#id ?? this.toString();
  }

  get value() {
    return this.#value;
  }

  set value(newValue) {
    if (!newValue) {
      this.#value = null;
      return;
    }
    if (!isNaN(parseInt(newValue))) {
      this.#value = parseInt(newValue);
      return;
    }
     this.#value = newValue;
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

  // toString() {
  //   return (this.suit?.symbol || '') + (this.value ?? '');
  // }

  toString() {
    return (this.suit?.symbol || '') + this.value;
  }

  static fromString(str, config) {
    if (config.getSymbolIndex(config.specialCards, str) >= 0) {
      return new Card(null, str, config);
    }
    return new Card(config.suits.getSuit(str[0]), str.substring(1), config);
  }

  valueOf() {
    return this.toString();
  }
}
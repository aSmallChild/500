import Suit from './Suit.js';

export default class CardRanking {
    /**
     * @param {Suit} suit 
     */
    constructor(suit) {
        this.suit = suit;
        this.lowToHighCardRanking = this.#calculateCardRanking();
    }

    // TODO: Build card ranking from deck config
    #calculateCardRanking() {
        return [
            '2', '3', '4', '5', '6', '7', '8', '9', '10',
            'Q', 'K', 'JL', 'JR', '$'
        ];
    }
}

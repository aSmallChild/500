import Deck from './game/model/Deck.js';

export class FiveHundred {
    constructor(numberOfPlayers) {
        this.numberOfPlayers = numberOfPlayers;
        this.deck = Deck.buildDeck({totalHands: numberOfPlayers});
    }
}
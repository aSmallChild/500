import Deck from './game/model/deck';

export class FiveHundred {
    constructor(numberOfPlayers) {
        this.numberOfPlayers = numberOfPlayers;
        this.deck = Deck.buildDeck({totalHands: numberOfPlayers});
    }
}
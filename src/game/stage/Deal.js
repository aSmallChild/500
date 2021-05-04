import GameStage from '../model/GameStage.js';
import OrdinaryNormalDeck from '../constants/OrdinaryNormalDeck.js';
import Deck from '../model/Deck.js';
import DeckConfig from '../model/DeckConfig.js';

export default class Deal extends GameStage {
    start() {
        const config = OrdinaryNormalDeck.getConfig();
        config.kittySize = 3;
        config.cardsPerPlayer = 10;
        config.totalHands = this.players.length;
        const deck = Deck.buildDeck(new DeckConfig(config));
        deck.shuffle();
        const kitty = deck.deal(config.kittySize);
        const hands = [];
        for (let i = 0; i < this.players.length; i++) {
            hands.push(deck.deal(config.cardsPerPlayer));
        }
        this.complete({hands, kitty, config});
    }
}
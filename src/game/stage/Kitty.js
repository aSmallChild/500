import GameStage from '../GameStage.js';
import Deck from '../model/Deck.js';
import DeckConfig from '../model/DeckConfig.js';

export default class Kitty extends GameStage {
    start(dataFromPreviousStage) {
        this.dataForNextStage = dataFromPreviousStage;
        this.config = new DeckConfig(dataFromPreviousStage.config);
        this.kitty = Deck.fromString(dataFromPreviousStage.kitty, this.config);
        this.hands = dataFromPreviousStage.hands.map(hand => Deck.fromString(hand, this.config));
        // if a partner is called, they are not revealed until the card is played
    }

}
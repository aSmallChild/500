import GameStage from '../GameStage.js';
import Deck from '../model/Deck.js';
import { GameAction } from '../GameAction.js';
import { GameEvents, GameEventsMessage } from '../GameEvents.js';
import Trick from '../model/Trick.js';

export default class Round extends GameStage {
    start(dataFromPreviousStage) {
        this.dataForNextStage = dataFromPreviousStage;
        this.hands = dataFromPreviousStage.hands;
        this.trick = new Trick(dataFromPreviousStage.highestBid.isNoTrumps, this.players.length); // TODO set constructor args
        this.currentPlayer = dataFromPreviousStage.highestBidder; // highest bidder leads play
    }

    onStageAction(player, actionName, actionData) {
        if (actionName === GameAction.PLACE_CARD) return this.#placeCard(player, actionData);
    }

    #placeCard(player, socket, actionData) {
        if (this.currentPlayer.position !== player.position) return socket.emit(GameEvents.OUT_OF_TURN, GameEventsMessage.OUT_OF_TURN);

        const card = this.#getCard(player, actionData);
        if (!card) return player.emit(GameEvents.INVALID_CARD, GameEventsMessage.INVALID_CARD);

        // TODO: if player can follow suit but doesn't deny emit.

        this.#recordCard(player, card);

        this.trick.playCard(card);
    }

    #getCard(player, actionData) {
        return this.hands[player.position].containsCard(actionData.card) ? actionData.card : null;
    }

    #recordCard(player, card) {
        this.clients.emit(GameEvents.PLACE_CARD, {player, card});
        this.hands[player.position].removeCard(card);
        this.#nextPlayer();
    }

    #nextPlayer() {
        for (let i = 0; i < this.players.length; i++) {
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
            return this.clients.emit(GameEvents.NEXT_PLAYER, this.currentPlayer);
        }

        const {card} = this.trick.endTrick();

        this.complete({
            // winningPlayer: player, // TODO: have a trick accept a player
            winningCard: card
        });
    }
}
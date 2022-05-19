import GameStage from '../GameStage.js';
import {GameAction} from '../GameAction.js';
import {GameEvents, GameEventsMessage} from '../GameEvents.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';
import {containsCard} from '../Deck.js';

const serializeTrick = trick => trick.map(([player, card]) => [player.position, card]);

export default class Round extends GameStage {
    start(dataFromPreviousStage) {
        this.dataForNextStage = dataFromPreviousStage;
        this.config = new DeckConfig(dataFromPreviousStage.deckConfig);
        this.winningBid = Bid.fromString(dataFromPreviousStage.winningBid, this.config);
        this.winningBidder = this.players[dataFromPreviousStage.winningBidderPosition];
        this.currentPlayer = this.winningBidder;
        this.hands = dataFromPreviousStage.hands.map(hand => Deck.fromString(hand, this.config));
        this.pastTricks = [];
        this.currentTrick = [];
    }

    onObserverConnect(observer) {
        this.emitStageMessage('deck_config', this.config, observer);
        this.emitStageMessage('winning_bid', {
            bid: this.winningBid,
            bidderPosition: this.winningBidder.position,
        }, observer);
        this.emitTricks(observer);
        this.emitCurrentTrick(observer);
    }

    onPlayerConnect(player, socket) {
        this.onObserverConnect(socket);
        this.emitPlayerHand(player, socket);
    }

    emitTricks(socket) {
        this.emitStageMessage('past_tricks', this.pastTricks.map(pastTrick => ({
            trick: serializeTrick(pastTrick.trick),
            winnerPosition: pastTrick.winner.position,
            winningCard: pastTrick.winningCard,
        })), socket);
    }

    emitCurrentTrick(socket) {
        this.emitStageMessage('current_trick', serializeTrick(this.currentTrick), socket);
    }

    nextTrick() {
        // this.trick = new Trick(this.players.length, dataFromPreviousStage.highestBid.isNoTrumps);

        // this.trick = new Deck();
    }

    onStageAction(player, socket, actionName, actionData) {
        if (actionName === GameAction.PLACE_CARD) return this.#placeCard(player, socket, actionData);
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
        return containsCard(this.hands[player.position], actionData.card) ? actionData.card : null;
    }

    #recordCard(player, card) {
        this.emitStageMessage(GameEvents.PLACE_CARD, {player, card});
        this.hands[player.position].removeCard(card);
        this.#nextPlayer();
    }

    #nextPlayer() {
        for (let i = 0; i < this.players.length; i++) {
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
            return this.emitStageMessage(GameEvents.NEXT_PLAYER, this.currentPlayer);
        }

        const {card} = this.trick.endTrick();

        this.complete({
            // winningPlayer: player, // TODO: have a trick accept a player
            winningCard: card
        });
    }
}
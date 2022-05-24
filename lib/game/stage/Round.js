import GameStage from '../GameStage.js';
import {GameEvents, GameEventsMessage} from '../GameEvents.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';
import Card from '../model/Card.js';

const serializeTrick = trick => trick.map(([player, card]) => [player.position, card]);

export default class Round extends GameStage {
    start(dataFromPreviousStage) {
        this.dataForNextStage = dataFromPreviousStage;
        this.config = new DeckConfig(dataFromPreviousStage.deckConfig);
        this.winningBid = Bid.fromString(dataFromPreviousStage.winningBid, this.config);
        this.winningBidder = this.players[dataFromPreviousStage.winningBidderPosition];
        this.currentPlayer = this.winningBidder;

        this.pastTricks = [];
        this.currentTrick = [];

        this.cards = new Map();
        // this.cardPlayer = new WeakMap();
        this.hands = dataFromPreviousStage.hands.map(
            (hand/*, position*/) =>
                hand.map(serializedCard => {
                    const card = Card.fromString(serializedCard, this.config);
                    // this.cardPlayer(this.players[position], card);
                    this.cards.set(serializedCard, card);
                    return card;
                }),
        );
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

    emitPlayerHand(player, socket = null) {
        socket = socket || player;
        this.emitStageMessage('hand', this.hands[player.position], socket);
    }

    emitTricks(socket) {
        this.emitStageMessage('past_tricks', this.pastTricks.map(pastTrick => ({
            trick: serializeTrick(pastTrick.trick),
            winnerPosition: pastTrick.winner.position,
            winningCard: pastTrick.winningCard,
        })), socket);
    }

    emitCurrentTrick(socket) {
        this.emitStageMessage('current_trick', {
            trick: serializeTrick(this.currentTrick),
            currentPlayerPosition: this.currentPlayer.position,
        }, socket);
    }

    onStageAction(player, socket, actionName, actionData) {
        switch (actionName) {
            case GameEvents.PLAY_CARD:
                return this.#playCard(player, socket, actionData);
        }
    }

    #playCard(player, socket, actionData) {
        if (this.currentPlayer.position !== player.position) {
            return this.emitStageMessage('error', GameEventsMessage.OUT_OF_TURN, socket);
        }

        const {card: serializedCard, from} = actionData;
        if (from != 'hand') {
            return this.emitStageMessage('error', 'You can only play card from your hand.', socket);
        }

        const card = this.cards.get(serializedCard);
        if (!card) {
            return this.emitStageMessage('error', GameEventsMessage.INVALID_CARD, socket);
        }

        const index = this.hands[player.position].indexOf(card);
        if (index < 0) {
            return this.emitStageMessage('error', GameEventsMessage.INVALID_CARD, socket);
        }

        // TODO: if player can follow suit but doesn't, deny emit.

        this.hands[player.position].splice(index, 1);
        this.emitPlayerHand(player, player);
        this.currentTrick.push([player, card]);

        if (this.currentTrick.length == this.players.length) {
            // todo write some actual rules to decide who won the trick
            const winner = player;
            const trick = {
                winner,
                winningCard: card,
                trick: this.currentTrick,
            };
            this.pastTricks.push(trick);
            this.emitTricks();
            this.currentTrick = [];

            if (this.pastTricks.length == this.config.cardsPerHand) {
                this.emitCurrentTrick(observer);
                return this.endRound();
            }

            this.currentPlayer = winner;
        } else {
            this.currentPlayer = this.players[(this.currentPlayer.position + 1) % this.players.length];
        }

        this.emitCurrentTrick();
    }

    endRound() {
        this.complete({});
    }
}
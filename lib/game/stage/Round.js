import GameStage from '../GameStage.js';
import {GameEvents, GameEventsMessage} from '../GameEvents.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';
import Card from '../model/Card.js';
import isFollowingSuit from '../rules/followSuit.js';
import {compareCards} from '../rules/cardValue.js';

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
        this.emitCurrentPlayer(observer);
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
            cardsPlayed: serializeTrick(pastTrick.cardsPlayed),
            winnerPosition: pastTrick.winner.position,
            winningCard: pastTrick.winningCard,
        })), socket);
    }

    emitCurrentTrick(socket) {
        this.emitStageMessage('current_trick', serializeTrick(this.currentTrick), socket);
    }

    emitCurrentPlayer(socket) {
        this.emitStageMessage('current_player_position', this.currentPlayer.position, socket);
    }

    onStageAction(player, socket, actionName, actionData) {
        switch (actionName) {
            case GameEvents.PLAY_CARD:
                return this.#playCard(player, socket, actionData);
        }
    }

    #playCard(player, socket, actionData) {
        // todo allow specifying a suit for the joker when it is played in no trumps, set the suit directly on the card
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

        const hand = this.hands[player.position];
        const index = hand.indexOf(card);
        if (index < 0) {
            return this.emitStageMessage('error', GameEventsMessage.INVALID_CARD, socket);
        }

        if (!isFollowingSuit(card, hand, this.currentTrick, this.pastTricks, this.winningBid.trumps)) {
            this.emitStageMessage('error', 'Must follow suit.', socket);
            this.emitStageMessage('reveal_card', {card, player, message: `${player.name} didn't follow suit and tried to play the ${card.getName()}.`});
            return;
        }

        this.hands[player.position].splice(index, 1);
        this.emitPlayerHand(player, player);
        this.currentTrick.push([card, player]);
        this.emitCurrentTrick();

        if (this.currentTrick.length == this.players.length) {
            const sortedCards = [...this.currentTrick];
            sortedCards.sort((a, b) => compareCards(a[0], b[0], this.currentTrick[0][0].suit, this.winningBid.trumps));
            const [[winningCard, winner]] = sortedCards;
            const trick = {
                winner,
                winningCard,
                cardsPlayed: this.currentTrick,
            };
            this.pastTricks.push(trick);
            this.emitTricks();
            this.currentTrick = [];

            if (this.pastTricks.length == this.config.cardsPerHand) {
                return this.endRound();
            }

            this.currentPlayer = winner;
        }
        else {
            this.currentPlayer = this.players[(this.currentPlayer.position + 1) % this.players.length];
        }

        this.emitCurrentPlayer();
    }

    endRound() {
        this.complete({});
    }
}
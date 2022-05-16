import GameStage from '../GameStage.js';
import Card from '../model/Card.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';

export default class Kitty extends GameStage {
    start(dataFromPreviousStage) {
        this.dataForNextStage = dataFromPreviousStage;
        this.config = new DeckConfig(dataFromPreviousStage.deckConfig);
        this.winningBid = Bid.fromString(dataFromPreviousStage.winningBid, this.config);
        this.winningBidder = this.players[dataFromPreviousStage.winningBidderPosition];

        this.kitty = this.#parseCards(dataFromPreviousStage.kitty);
        this.hands = dataFromPreviousStage.hands.map(hand => this.#parseCards(hand));
        this.cards = new Map();
        for (const deck of [this.kitty, ...this.hands]) {
            for (const card of deck) {
                this.cards.set(card.toString(), card);
            }
        }
        // todo determine how many cards they can call, if any
    }

    #parseCards(cards) {
        return cards.map(card => Card.fromString(card, this.config));
    }

    findCard(serializedCard) {
        // return [card, hand, position, isKitty];
        const card = this.cards.get(serializedCard);
        if (!card) return [];
        if (this.kitty.includes(card)) {
            return [card, this.kitty, -1, true];
        }

        for (let i = 0; i < this.hands.length; i++) {
            const hand = this.hands[i];
            if (hand.includes(card)) {
                return [card, hand, i, false];
            }
        }

        return [];
    }

    // todo
    // - if the player swaps a card, it animates for all connected sockets for that player
    // support both clicking on a card and dragging a card on top of another card to control the order
    // continue button
    // other players see face down cards move between the kitty and the players hand

    onPlayerConnect(player, socket) {
        this.onObserverConnect(socket);
        this.emitPlayerCards(player, socket);
    }

    onObserverConnect(observer) {
        this.emitStageMessage('deck_config', this.config, observer);
        this.emitStageMessage('winning_bid', {
            bid: this.winningBid,
            bidderPosition: this.winningBidder.position,
        }, observer);
    }

    onStageAction(player, socket, actionName, actionData) {
        try {
            if (player !== this.winningBidder) return this.emitStageMessage(`${actionName}_error`, 'Only the winning bidder can perform this action', socket);
            if (actionName === 'call_partner') return this.callPartner(player, socket, actionData);
            if (actionName === 'move_card') return this.moveCardToOrFromKitty(player, socket, actionData);
            if (actionName === 'drop_card') return this.dropCard(player, socket, actionData);
            if (actionName === 'done') return this.done(player, socket);
        } catch (err) {
            this.emitStageMessage('error', 'ERROR: ' + err.toString() + err.stack, socket);
        }
    }

    emitPlayerCards(player, socket) {
        if (player == this.winningBidder) {
            this.emitStageMessage('kitty', this.kitty, socket);
        }
        this.emitStageMessage('hand', this.hands[player.position], socket);
    }

    callPartner(player, socket, actionData) {
        if (!this.config.can_call_card) { // todo
            this.emitStageMessage('call_partner_error', 'Cannot call partner by card in this game.', socket);
        }
    }

    moveCardToOrFromKitty(player, socket, actionData) {
        const {card: serializedCard, from} = actionData;
        const playerHand = this.hands[player.position];
        const [card, hand] = this.findCard(serializedCard);

        if (from == 'hand' && playerHand != hand) return;
        if (from == 'kitty' && this.kitty != hand) return;

        const to = from == 'hand' ? this.kitty : playerHand;
        hand.splice(hand.indexOf(card), 1);
        to.push(card);
        return this.emitPlayerCards(player, player);

        // todo tell other players (who only see face down cards) that a random card has moved
    }

    dropCard(player, socket, actionData) {
        const {card, droppedOnHand, droppedOnCard} = actionData;
        // todo implement this when serializing a deck maintains the order of cards
        // deserialize cards
        // droppedOn can be null if they placed it as the first card in their hand
        // move that card to that position
    }

    done(player, socket) {
        const hand = this.hands[player.position];
        if (hand.length != this.config.cardsPerHand) {
            return this.emitStageMessage('error', `You have must have ${this.config.cardsPerHand} in your hand to start the game.`, socket);
        }

        this.complete({...this.dataForNextStage, kitty: this.kitty, hands: this.hands});
    }
}
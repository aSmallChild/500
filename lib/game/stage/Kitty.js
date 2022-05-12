import GameStage from '../GameStage.js';
import Deck from '../model/Deck.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';

export default class Kitty extends GameStage {
    start(dataFromPreviousStage) {
        this.dataForNextStage = dataFromPreviousStage;
        this.config = new DeckConfig(dataFromPreviousStage.deckConfig);
        // todo determine how many cards they can call, if any
        this.winningBidder = this.players[dataFromPreviousStage.winningBidderPosition];
        this.winningBid = Bid.fromString(dataFromPreviousStage.winningBid, this.config);

        this.kitty = Deck.fromString(dataFromPreviousStage.kitty, this.config);
        this.hands = dataFromPreviousStage.hands.map(hand => Deck.fromString(hand, this.config));
        this.cards = new Map();
        for (const deck of [this.kitty, ...this.hands]) {
            for (const card of deck) {
                this.cards.set(card.toString(), card);
            }
        }
    }

    findCard(serializedCard) {
        // return [card, hand, position, isKitty];
        const card = this.cards.get(serializedCard);
        if (!card) return [];
        if (this.kitty.containsCard(card)) {
            return [card, this.kitty, -1, true];
        }

        for (let i = 0; i < this.hands.length; i++) {
            const hand = this.hands[i];
            if (hand.containsCard(card)) {
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
        const [card, hand, position] = this.findCard(serializedCard);

        if (!card) {
            this.emitStageMessage('error', 'ERROR: card not found', socket);
        }
        else {
            this.emitStageMessage('error', `DEBUG: GOT CARD ${card.getName()} in position ${position}`, socket);
        }

        if (from == 'hand' && playerHand != hand) return this.emitStageMessage('error', `DEBUG: AAA`, socket);
        if (from == 'kitty' && this.kitty != hand) return this.emitStageMessage('error', `DEBUG: BBB`, socket);

        const to = from == 'hand' ? this.kitty : playerHand;
        hand.cards.splice(hand.cards.indexOf(card), 1);
        to.cards.push(card);
        return this.emitPlayerCards(player, player);

        // todo tell other players (who only see face down cards) that a random card has moved
    }

    dropCard(player, socket, actionData) {
        const {card, droppedOnHand, droppedOnCard} = actionData;
        // deserialize cards
        // droppedOn can be null if they placed it as the first card in their hand
        // move that card to that position
    }

    done(player, socket) {
        const hand = this.hands[player.position];
        if (hand.length != this.config.cardsPerHand) {
            return this.emitStageMessage('error', `Your hand has ${hand.length} cards but can only have ${this.config.cardsPerHand}.`, socket);
        }

        this.complete(this.dataForNextStage);
    }
}
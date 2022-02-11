import GameStage from '../GameStage.js';
import Deck from '../model/Deck.js';
import DeckConfig from '../model/DeckConfig.js';
import Bid from '../model/Bid.js';

export default class Kitty extends GameStage {
    start(dataFromPreviousStage) {
        // this.complete({
        //     deckConfig: this.config,
        //     kitty: this.kitty,
        //     hands: this.hands,
        //     winningBid: this.highestBid,
        //     winningBidder: this.highestBidder.position,
        // });
        this.dataForNextStage = dataFromPreviousStage;
        this.config = new DeckConfig(dataFromPreviousStage.deckConfig);
        this.kitty = Deck.fromString(dataFromPreviousStage.kitty, this.config);
        this.hands = dataFromPreviousStage.hands.map(hand => Deck.fromString(hand, this.config));
        // todo determine how many cards they can call, if any
        this.winningBidder = this.players[dataFromPreviousStage.winningBidderPosition];
        this.winningBid = Bid.fromString(dataFromPreviousStage.winningBid, this.config);
    }

    // todo
    // - send kitty to winning bidder
    // - if the player swaps a card, it animates for all connected sockets for that player
    // support both clicking on a card and dragging a card ontop of another card to control the order
    // continue button
    // other players see face down cards move between the kitty and the players hand

    onPlayerConnect(player, socket) {
        // todo if everyone has a partner this is allowed to be known (needs to be in bidding phase too)
        if (player == this.winningBidder) {
            this.emitStageMessage(`kitty`, this.kitty, socket);
        }
        this.emitStageMessage(`hand`, this.winningBid, socket);
    }

    onObserver(observer) {
        this.emitStageMessage('deck_config', this.config, observer);
        this.emitStageMessage(`winning_bid`, this.winningBid, observer);
        this.emitStageMessage(`winning_bidder_position`, this.winningBidder.position, observer);
    }

    onStageAction(player, actionName, actionData) {
        if (player !== this.winningBidder) return this.emitStageMessage(`${actionName}_error`, 'Only the winning bidder can perform this action', player);
        if (actionName === 'call_partner') return this.callPartner(player, actionData);
        if (actionName === 'move_card') return this.moveCard(player, actionData);
        if (actionName === 'drop_card') return this.dropCard(player, actionData);
        if (actionName === 'done') return this.complete(dataForNextStage);
    }

    callPartner(player, actionData) {
        if (!this.config.can_call_card) { // todo
            this.emitStageMessage('call_partner_error', 'Cannot call partner by card in this game.', player);
        }
    }

    moveCard(player, actionData) {
        // move a card from the kitty to their hand, or vice versa
        // tell other players (who only see face down cards) that a random card has moved
    }

    dropCard(player, actionData) {

    }
}
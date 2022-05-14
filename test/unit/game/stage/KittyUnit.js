import assert from 'assert';
import Kitty from '../../../../lib/game/stage/Kitty.js';
import {getPlayers, getStage} from '../../../util/stage.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import Deck from '../../../../lib/game/model/Deck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';

const getStartData = stage => {
    const deckConfig = new DeckConfig(OrdinaryNormalDeck.config);
    deckConfig.kittySize = 3;
    deckConfig.cardsPerHand = 10;
    deckConfig.totalHands = stage.players.length;
    const deck = Deck.buildDeck(deckConfig);
    const kitty = deck.deal(deckConfig.kittySize);
    const hands = stage.players.map(() => deck.deal(deckConfig.cardsPerHand));
    return JSON.parse(JSON.stringify({
        deckConfig,
        winningBidderPosition: 3,
        winningBid: '7S:140',
        kitty,
        hands,
    }));
};
describe('Kitty Stage Unit', () => {
    let stage;
    beforeEach(() => {
        stage = getStage(getPlayers(6), Kitty);
    });
    describe(`start()`, () => {
        it(`should figure out who the winning bidder is`, () => {
            stage.start(getStartData(stage));
            assert.equal(stage.players[3], stage.winningBidder);
        });
    });
    describe(`findCard()`, () => {
        it(`should find the ten of spades`, () => {
            stage.start(getStartData(stage));
            const [card] = stage.findCard('S10');
            assert.equal(!!card, true);
            assert.equal(card.getName(), '10 of Spades');
            assert.equal(card.suit.symbol, 'S');
            assert.equal(card.value, 10);
        });
    });
    describe(`moveCard()`, () => {
        it(`should move a card from the kitty to the top of the hand`, () => {
            stage.start(getStartData(stage));
            const player = stage.winningBidder;
            const card = stage.kitty.cards[1];
            stage.moveCardToOrFromKitty(player, player, {card: card.toString(), from: 'kitty'});
            const hand = stage.hands[player.position].cards;
            assert.equal(hand[hand.length - 1], card);
        });
        it(`should move a card from the hand to the top of the kitty`, () => {
            stage.start(getStartData(stage));
            const player = stage.winningBidder;
            const card = stage.hands[player.position].cards[1];
            stage.moveCardToOrFromKitty(player, player, {card: card.toString(), from: 'hand'});
            const hand = stage.kitty.cards;
            assert.equal(hand[hand.length - 1], card);
        });
    });

});
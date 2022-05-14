import assert from 'assert';
import { GameAction } from '../../../../lib/game/GameAction.js';
import Bid from '../../../../lib/game/model/Bid.js';
import Deck from '../../../../lib/game/model/Deck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import Round from '../../../../lib/game/stage/Round.js';
import {getPlayers, getStage} from '../../../util/stage.js';

describe('Round Stage Unit', function() {
    const config = new DeckConfig(OrdinaryNormalDeck.config);
    const players = getPlayers(5);
    const stage = getStage(players, Round);
    const deck = Deck.buildDeck(config);
    const hands = players.map(() => deck.deal(config.cardsPerHand));

    describe(`start()`, () => {
        it(`should setup trick`, () => {
            stage.start({
                hands: hands,
                highestBidder: players[0],
                highestBid:  new Bid(6, null, null, null, 100, config),
            });
            assert.ok(stage.trick);
            assert.ok(stage.currentPlayer);
        });
    });

    describe('onStageAction()', () => {
        it('playing card removes card from players hand', () => {
            const winningPosition = 0;
            const winningBidder = players[winningPosition];
            stage.start({
                hands: hands,
                highestBidder: winningBidder,
                highestBid:  new Bid(6, null, null, null, 100, config),
            });
            const card = hands[winningPosition].cards[0];
            debugger;
            stage.onStageAction(winningBidder, winningBidder, GameAction.PLACE_CARD, {
                card: card
            });
            const containsCard = stage.hands[winningPosition].containsCard(card);
            assert.equal(containsCard, true)
        });

        it('opening player plays card becoming winning card', () => {
            const winningPosition = 0;
            const winningBidder = players[winningPosition];
            stage.start({
                hands: hands,
                highestBidder: winningBidder,
                highestBid:  new Bid(6, null, null, null, 100, config),
            });
            const openingCard = hands[winningPosition].cards[0];
            stage.onStageAction(winningBidder, winningBidder, GameAction.PLACE_CARD, {
                card: openingCard
            });
            const winningCard = stage.trick.endTrick();
            assert.equal(winningCard, openingCard);
        });
    });
});
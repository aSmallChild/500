// noinspection ES6UnusedImports
import should from 'should';
import { GameAction } from '../../../../src/game/GameAction.js';
import Bid from '../../../../src/game/model/Bid.js';
import Deck from '../../../../src/game/model/Deck.js';
import DeckConfig from '../../../../src/game/model/DeckConfig.js';
import OrdinaryNormalDeck from '../../../../src/game/model/OrdinaryNormalDeck.js';
import Round from '../../../../src/game/stage/Round.js';
import {getPlayers, getStage} from '../../../util/stage.js';

describe('Round Stage Unit', function() {
    const config = new DeckConfig(OrdinaryNormalDeck.config);
    const players = getPlayers(5, true);
    const stage = getStage(players, Round);
    const deck = Deck.buildDeck(config);
    const hands = players.map(() => deck.deal(config.cardsPerHand));

    describe(`start()`, () => {
        it(`should setup trick`, () => {
            // Act
            stage.start({
                hands: hands,
                highestBidder: players[0],
                highestBid:  new Bid(6, null, null, null, 100, config),
            });

            // Assert
            should(stage.trick).be.ok;
            should(stage.currentPlayer).be.ok;
        });
    });

    describe('onPlayerAction()', () => {
        it('playing card removes card from players hand', () => {
            // Arrange
            const winningPosition = 0;
            const winningBidder = players[winningPosition];
            stage.start({
                hands: hands,
                highestBidder: winningBidder,
                highestBid:  new Bid(6, null, null, null, 100, config),
            });
            const card = hands[winningPosition].cards[0];

            // Act
            stage.onPlayerAction(winningBidder, GameAction.PLACE_CARD, {
                card: card
            });
            const containsCard = stage.hands[winningPosition].containsCard(card);

            // Assert
            containsCard.should.be.true();
        });

        it('opening player plays card becoming winning card', () => {
            // Arrange
            const winningPosition = 0;
            const winningBidder = players[winningPosition];
            stage.start({
                hands: hands,
                highestBidder: winningBidder,
                highestBid:  new Bid(6, null, null, null, 100, config),
            });
            const openingCard = hands[winningPosition].cards[0];

            // Act
            stage.onPlayerAction(winningBidder, GameAction.PLACE_CARD, {
                card: openingCard
            });

            // Assert
            const winningCard = stage.trick.endTrick();
            winningCard.should.equal(openingCard);
        });
    });
});
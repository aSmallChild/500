import assert from 'assert';
import {buildDeck, deal, cardsToString} from '../../../../lib/game/Deck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import Round from '../../../../lib/game/stage/Round.js';
import {getPlayers, getStage} from '../../../util/stage.js';

const deckConfig = new DeckConfig(OrdinaryNormalDeck.config);

function getStartData(stage) {
    deckConfig.kittySize = 3;
    deckConfig.cardsPerHand = 10;
    deckConfig.totalHands = stage.players.length;
    const cards = buildDeck(deckConfig);
    const kitty = deal(cards, deckConfig.kittySize);
    const hands = stage.players.map(() => deal(cards, deckConfig.cardsPerHand));
    return JSON.parse(JSON.stringify({
        deckConfig,
        winningBidderPosition: 3,
        winningBid: '7S:140',
        kitty,
        hands,
    }));
}

describe('Round Stage Unit', () => {
    let stage, players;

    beforeEach(() => {
        players = getPlayers(4);
        stage = getStage(players, Round);
    });

    describe(`start()`, () => {
        it(`should deserialize all the things`, () => {
            stage.start(getStartData(stage));
            assert.equal(stage.hands.length, 4);
            assert.equal(stage.currentPlayer, players[3]);
            assert.equal(stage.winningBid.trumps.symbol, 'S');
            assert.equal(stage.winningBid.tricks, 7);
            assert.equal(stage.hands.map(hand => cardsToString(hand, deckConfig)).join(':'), 'C7-5SAKQJ10-8:D6-4CAKQJ10-8:H5,4DAKQJ10-7:$HAKQJ10-6');
        });
    });

    describe('onPlayerConnect()', () => {
        it('sends player their hand', () => {
        });
        it('shows player what has been played so far', () => {
        });
    });

    describe('onStageAction()', () => {
        it('can play card', () => {
        });
        it('can identify winning card', () => {
        });
        it('winner leads next round', () => {
        });
        it('reveals cards played in error', () => {
        });
    });

    describe('onStageComplete()', () => {
        it('can complete stage', () => {
        });
        it('adds the scores correctly', () => {
        });
    });
});
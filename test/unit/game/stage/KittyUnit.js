import assert from 'assert';
import Bidding from '../../../../lib/game/stage/Bidding.js';
import {getPlayers, getStage} from '../../../util/stage.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';

const getStartData = stage => {
    const config = OrdinaryNormalDeck.config;
    config.kittySize = 3;
    config.cardsPerHand = 10;
    config.totalHands = stage.players.length;
    return {deckConfig: config};
};
describe('Kitty Stage Unit', () => {
    describe(`start()`, () => {
        const stage = getStage(getPlayers(23), Bidding);
        it(`should deal cards to all players`, () => {
            stage.start(getStartData(stage));
            assert.equal(stage.kitty.size, 3);
            assert.equal(stage.hands.length, 23);
            assert.equal(stage.players.length, 23);
            for (const hand of stage.hands) {
                assert.equal(hand.size, 10);
            }
        });
    });

});
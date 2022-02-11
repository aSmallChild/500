// noinspection ES6UnusedImports
/* eslint-disable no-unused-vars,no-undef */
import should from 'should';
import Bidding from '../../../../lib/game/stage/Bidding.js';
import {getPlayers, getStage} from '../../../util/stage.js';
import {GameAction} from '../../../../lib/game/GameAction.js';
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
            stage.kitty.size.should.equal(3);
            stage.hands.should.length(23);
            stage.players.should.length(23);
            for (const hand of stage.hands) {
                hand.size.should.equal(10);
            }
        });
    });

});
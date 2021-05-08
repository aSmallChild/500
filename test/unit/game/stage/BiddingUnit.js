// noinspection ES6UnusedImports
import should from 'should';
import Bidding from '../../../../src/game/stage/Bidding.js';
import {getPlayers, getStage} from '../../util/stage.js';

describe('Deal Stage Unit', function() {
    describe(`start()`, function() {
        const stage = getStage(getPlayers(23), Bidding);
        it(`should deal cards to all players`, function() {
            stage.start();
            stage.handsDealt.kitty.size.should.equal(3);
            stage.handsDealt.hands.should.length(23);
            stage.players.should.length(23);
            for (const hand of stage.handsDealt.hands) {
                hand.size.should.equal(10);
            }
        });
    });
});

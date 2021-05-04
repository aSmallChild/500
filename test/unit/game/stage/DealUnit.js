// noinspection ES6UnusedImports
import should from 'should';
import Deal from '../../../../src/game/stage/Deal.js';
import {getPlayers, getStage} from '../../util/stage.js';

describe('Deal Stage Unit', function() {
    describe(`start()`, function() {
        const stage = getStage(getPlayers(23), Deal);
        it(`should deal cards to all players`, function(done) {
            stage.onStageComplete((data) => {
                data.kitty.size.should.equal(3);
                data.hands.should.length(23);
                for (const hand of data.hands) {
                    hand.size.should.equal(10);
                }
                done();
            });
            stage.start();
        });
    });
});

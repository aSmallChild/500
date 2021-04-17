import Deck from '../../../../src/game/model/deck.js';
import Timer from '../../../../src/util/timer.js';
// noinspection ES6UnusedImports
import should from 'should';

describe('Deck Performance', function() {
    describe('buildDeck()', function() {
        const timer = new Timer();
        for (const config of [
            {
                totalHands: 5,
                _buildCount: 10000,
                _maxDurationMs: 75,
            }, {
                totalHands: 63,
                _buildCount: 2500,
                _maxDurationMs: 80,

            }]) {
            timer.start();
            it(`should build ${config._buildCount} ${config.totalHands} handed in less than ${config._maxDurationMs}ms`, function() {
                for (let i = 0; i < config._buildCount; i++) {
                    Deck.buildDeck(config);
                }
                timer.getDurationMs().should.be.belowOrEqual(config._maxDurationMs, `expected deck build time exceeded ${timer.getDurationMs()}ms > ${config._maxDurationMs}ms`);
            });
        }
    });
});
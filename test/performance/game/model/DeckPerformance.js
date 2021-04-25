import Deck from '../../../../src/game/model/Deck.js';
import Timer from '../../../../src/util/Timer.js';
// noinspection ES6UnusedImports
import should from 'should';

describe('Deck Performance', function() {
    describe('buildDeck()', function() {
        const timer = new Timer();
        for (const config of [
            {
                totalHands: 5,
                _buildCount: 100000,
                _maxDurationMs: 75,
            }, {
                totalHands: 100,
                _buildCount: 5000,
                _maxDurationMs: 75,

            }]) {
            it(`should build ${config._buildCount} ${config.totalHands} handed decks in less than ${config._maxDurationMs}ms`, function() {
                timer.start();
                for (let i = 0; i < config._buildCount; i++) {
                    Deck.buildDeck(config);
                }
                timer.getDurationMs().should.be.belowOrEqual(config._maxDurationMs, `expected deck build time exceeded ${timer.getDurationMs()}ms > ${config._maxDurationMs}ms`);
            });
        }
    });
});
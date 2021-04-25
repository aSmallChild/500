import Deck from '../../../../src/game/model/Deck.js';
import Timer from '../../../../src/util/Timer.js';
import SuitCollection from '../../../../src/game/model/SuitCollection.js';
import OrdinaryNormalDeck from '../../../../src/game/constants/OrdinaryNormalDeck.js';
// noinspection ES6UnusedImports
import should from 'should';

const suits = new SuitCollection(OrdinaryNormalDeck.SUITS_HIGH_TO_LOW);
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
                    Deck.buildDeck(config, suits);
                }
                timer.getDurationMs().should.be.belowOrEqual(config._maxDurationMs, `expected deck build time exceeded ${timer.getDurationMs()}ms > ${config._maxDurationMs}ms`);
            });
        }
    });
});
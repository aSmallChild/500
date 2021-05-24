import Deck from '../../../../src/game/model/Deck.js';
import Timer from '../../../../src/util/Timer.js';
import OrdinaryNormalDeck from '../../../../src/game/constants/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../src/game/model/DeckConfig.js';
// noinspection ES6UnusedImports
import should from 'should';

describe('Deck Performance', function() {
    describe('buildDeck()', function() {
        const timer = new Timer();
        for (const c of [
            {
                totalHands: 5,
                _buildCount: 100000,
                _maxDurationMs: 100,
            }, {
                totalHands: 100,
                _buildCount: 5000,
                _maxDurationMs: 100,

            }]) {
            const config = new DeckConfig(OrdinaryNormalDeck.config);
            for (const x in c) {
                if (c.hasOwnProperty(x)) config[x] = c[x];
            }
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
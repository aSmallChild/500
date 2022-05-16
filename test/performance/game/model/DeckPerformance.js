import {buildDeck} from '../../../../lib/game/Deck.js';
import Timer from '../../../../lib/util/Timer.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import assert from 'assert';

describe('Deck Performance', () => {
    describe('buildDeck()', () => {
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
            it(`should build ${config._buildCount} ${config.totalHands} handed decks in less than ${config._maxDurationMs}ms`, () => {
                timer.start();
                for (let i = 0; i < config._buildCount; i++) {
                    buildDeck(config);
                }
                assert(timer.getDurationMs() <= config._maxDurationMs, `expected deck build time exceeded ${timer.getDurationMs()}ms > ${config._maxDurationMs}ms`);
            });
        }
    });
});
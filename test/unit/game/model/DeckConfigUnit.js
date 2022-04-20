import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import assert from 'assert';

describe('DeckConfig Unit', function() {
    const configTypes = [
        OrdinaryNormalDeck,
    ];
    for (const configType of configTypes) {
        describe(`Config: ${configType.name}`, function() {
            const config = new DeckConfig(configType.config);
            it(`should have unique card symbols`, function() {
                const symbols = new Set();
                for (const card of [...config.suits, ...config.suitPictureCards, ...config.specialCards]) {
                    const symbol = card.symbol;
                    assert(symbol, 'symbol is missing');
                    assert(!symbols.has(symbol), `symbol set contained a duplicate ${symbol}`);
                    symbols.add(symbol);
                }
            });
            it(`should have unique bid symbols`, function() {
                const symbols = new Set();
                for (const bid of config.specialBids) {
                    const symbol = bid.symbol;
                    assert(symbol, 'symbol is missing');
                    assert(!symbols.has(symbol), `symbol set contained a duplicate ${symbol}`);
                    symbols.add(symbol);
                }
            });
            it(`should have unique suit symbols`, function() {
                const symbols = new Set();
                for (const suit of config.suits) {
                    const symbol = suit.symbol;
                    assert(symbol, 'symbol is missing');
                    assert(!symbols.has(symbol), `symbol set contained a duplicate ${symbol}`);
                    symbols.add(symbol);
                }
            });
            it(`should have colours for all the suits`, function() {
                for (const suit of config.suits) {
                    assert(suit.color);
                }
            });
        });
    }
});

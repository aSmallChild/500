/* eslint-disable */
import OrdinaryNormalDeck from '../../../../src/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../src/game/model/DeckConfig.js';
// noinspection ES6UnusedImports
import should from 'should';

describe('DeckConfig Unit', function() {
    const configTypes = [
        OrdinaryNormalDeck
    ];
    for (const configType of configTypes) {
        describe(`Config: ${configType.name}`, function() {
            const config = new DeckConfig(configType.config);
            it(`should have unique card symbols`, function() {
                const symbols = new Set();
                for (const card of [...config.suits, ...config.suitPictureCards, ...config.specialCards]) {
                    const symbol = card.symbol;
                    should.exist(symbol, 'symbol is missing');
                    symbols.has(symbol).should.be.false(`symbol set contained a duplicate ${symbol}`);
                    symbols.add(symbol);
                }
            });
            it(`should have unique bid symbols`, function() {
                const symbols = new Set();
                for (const bid of config.specialBids) {
                    const symbol = bid.symbol;
                    should.exist(symbol, 'symbol is missing');
                    symbols.has(symbol).should.be.false(`symbol set contained a duplicate ${symbol}`);
                    symbols.add(symbol);
                }
            });
            it(`should have unique suit symbols`, function() {
                const symbols = new Set();
                for (const suit of config.suits) {
                    const symbol = suit.symbol;
                    should.exist(symbol, 'symbol is missing');
                    symbols.has(symbol).should.be.false(`symbol set contained a duplicate ${symbol}`);
                    symbols.add(symbol);
                }
            });
            it(`should have colours for all the suits`, function() {
                for (const suit of config.suits) {
                    suit.color.should.not.be.empty();
                }
            });
        });
    }
});

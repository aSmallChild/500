import Bid from '../../../../lib/game/model/Bid.js';
import assert from 'assert';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';

const config = new DeckConfig(OrdinaryNormalDeck.config);
const testBids = [
    ['M:250', new Bid(null, null, null, 'M', 250, config)],
    ['6S:40', new Bid(6, config.suits.getSuit('S'), null, null, 40, config)],
    ['7S!C:140', new Bid(7, config.suits.getSuit('S'), config.suits.getSuit('C'), null, 140, config)],
    ['6:100', new Bid(6, null, null, null, 100, config)],
    ['6!S:40', new Bid(6, null, config.suits.getSuit('S'), null, 40, config)],
];
describe('Bid Unit', () => {
    describe('toString()', () => {
        for (const [str, bid] of testBids) {
            it(`serialize '${bid.getName()}' to ${str}`, () => {
                assert.equal(bid + '', str);
            });
        }
    });
    describe('fromString()', () => {
        for (const [str, bid] of testBids) {
            it(`deserialize ${str} to '${bid.getName()}'`, () => {
                const newBid = Bid.fromString(str, config);
                bidsDeepEqual(newBid, bid);
            });
        }
    });
    describe('avondaleBids()', () => {
        const bids = Bid.getAvondaleBids(config);
        let points = 0;
        it(`should have unique bids`, () => {
            const uniqueBids = new Set();
            for (const bid of bids) {
                assert.equal(typeof bid.points, 'number');
                assert(bid.points >= points);
                points = bid.points;
                const str = bid + '';
                assert(bid, 'bid is missing')
                assert(!uniqueBids.has(str), `bid set contained a duplicate ${str}`);
                uniqueBids.add(str);
            }
        });
        it(`should have 29 bids`, () => {
            assert.equal(bids.length, 29);
        });
    });
});

function bidsDeepEqual(actual, expected) {
    for (const property of ['trumps', 'antiTrumps', 'tricks', 'special', 'points']) {
        if (!actual[property]) {
            assert.strictEqual(null, actual[property], `actual.${property} is not null`);
            assert.strictEqual(null, expected[property], `expected.${property} is not null`);
        } else {
            assert.strictEqual(actual[property], expected[property], `bid.${property} '${actual[property]}' != '${expected[property]}' does not match`);
        }
    }
}
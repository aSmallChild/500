import Bid from '../../../../src/game/model/Bid.js';
import OrdinaryNormalDeck from '../../../../src/game/constants/OrdinaryNormalDeck.js';
// noinspection ES6UnusedImports
import should from 'should';
import DeckConfig from '../../../../src/game/model/DeckConfig.js';

const config = new DeckConfig(OrdinaryNormalDeck.getConfig())
const testBids = [
    ['M:250', new Bid(null, null, null, 'M', 250, config)],
    ['6♠:40', new Bid(6, config.suits.getSuit('♠'), null, null, 40, config)],
    ['7♠!♣:140', new Bid(7, config.suits.getSuit('♠'), config.suits.getSuit('♣'), null, 140, config)],
    ['6:100', new Bid(6, null, null, null, 100, config)],
    ['6!♠:40', new Bid(6, null, config.suits.getSuit('♠'), null, 40, config)],
];
describe('Bid Unit', function() {
    describe('toString()', function() {
        for (const [str, bid] of testBids) {
            it(`serialize '${bid.getName()}' to ${str}`, function() {
                (bid + '').should.equal(str);
            });
        }
    });
    describe('fromString()', function() {
        for (const [str, bid] of testBids) {
            it(`deserialize ${str} to '${bid.getName()}'`, function() {
                const newBid = Bid.fromString(str, config);
                bidsDeepEqual(bid, newBid);
            });
        }
    });
    describe('avondaleBids()', function() {
        const bids = Bid.getAvondaleBids(config);
        let points = 0;
        it(`should have unique bids`, function() {
            const uniqueBids = new Set();
            for (const bid of bids) {
                bid.points.should.be.type('number');
                bid.points.should.be.aboveOrEqual(points);
                points = bid.points;
                const str = bid + '';
                should.exist(bid, 'bid is missing');
                uniqueBids.has(str).should.be.false(`bid set contained a duplicate ${str}`);
                uniqueBids.add(str);
            }
        });
        it(`should have 29 bids`, function() {
            bids.length.should.equal(29);
        });
    });
});

function bidsDeepEqual(actual, expected) {
    for (const property of ['trumps', 'antiTrumps', 'tricks', 'special', 'points']) {
        if (!actual[property]) {
            should.strictEqual(null, actual[property], `actual.${property} is not null`);
            should.strictEqual(null, expected[property], `expected.${property} is not null`);
        } else {
            should.strictEqual(actual[property], expected[property], `bid.${property} '${actual[property]}' != '${expected[property]}' does not match`);
        }
    }
}
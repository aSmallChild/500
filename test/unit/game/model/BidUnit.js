// noinspection ES6UnusedImports
/* eslint-disable no-unused-vars,no-undef */import Bid from '../../../../src/game/model/Bid.js';
import should from 'should';
import OrdinaryNormalDeck from '../../../../src/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../src/game/model/DeckConfig.js';

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
                (bid + '').should.equal(str);
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
                bid.points.should.be.type('number');
                bid.points.should.be.aboveOrEqual(points);
                points = bid.points;
                const str = bid + '';
                should.exist(bid, 'bid is missing');
                uniqueBids.has(str).should.be.false(`bid set contained a duplicate ${str}`);
                uniqueBids.add(str);
            }
        });
        it(`should have 29 bids`, () => {
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
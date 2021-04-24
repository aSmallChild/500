import Suit from '../../../../src/game/model/suit.js';
import Bid from '../../../../src/game/model/bid.js';
// noinspection ES6UnusedImports
import should from 'should';

const testBids = [
    ['250:M', new Bid(null, null, null, 'M', 250)],
    ['40:6♠', new Bid(6, Suit.SPADE, null, null, 40)],
    ['140:7♠!♣', new Bid(7, Suit.SPADE, Suit.CLUB, null, 140)],
    ['100:6', new Bid(6, null, null, null, 100)],
    ['40:6!♠', new Bid(6, null, Suit.SPADE, null, 40)],
];
describe('Card Unit', function() {
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
                const newBid = Bid.fromString(str);
                bidsDeepEqual(bid, newBid);
            });
        }
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
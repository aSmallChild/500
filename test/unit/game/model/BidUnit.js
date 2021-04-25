import Bid from '../../../../src/game/model/Bid.js';
import SuitCollection from '../../../../src/game/model/SuitCollection.js';
import OrdinaryNormalDeck from '../../../../src/game/constants/OrdinaryNormalDeck.js';
// noinspection ES6UnusedImports
import should from 'should';

const suits = new SuitCollection(OrdinaryNormalDeck.SUITS_HIGH_TO_LOW);
const testBids = [
    ['250:M', new Bid(null, null, null, 'M', 250, suits)],
    ['40:6♠', new Bid(6, '♠', null, null, 40, suits)],
    ['140:7♠!♣', new Bid(7, '♠', '♣', null, 140, suits)],
    ['100:6', new Bid(6, null, null, null, 100, suits)],
    ['40:6!♠', new Bid(6, null, '♠', null, 40, suits)],
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
                const newBid = Bid.fromString(str, suits);
                bidsDeepEqual(bid, newBid);
            });
        }
    });
    describe('avondaleBids()', function() {
        const bids = Bid.getAvondaleBids(suits);
        for (const bid of bids) {
            console.log('' + bid);
        }
        it(`should have 28 bids'`, function() {
            bids.length.should.equal(28);
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
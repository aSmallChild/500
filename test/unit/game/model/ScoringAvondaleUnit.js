import assert from 'assert';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import ScoringAvondale from '../../../../lib/game/model/ScoringAvondale.js';

const config = new DeckConfig(OrdinaryNormalDeck.config);
const scoring = new ScoringAvondale(config);

const spades = config.suits.getSuit('S');
const clubs = config.suits.getSuit('C');
const diamonds = config.suits.getSuit('D');
const hearts = config.suits.getSuit('H');
const testBids = [
    {tricks: 6, suit: spades, points: 40},
    {tricks: 6, suit: clubs, points: 60},
    {tricks: 6, suit: diamonds, points: 80},
    {tricks: 6, suit: hearts, points: 100},
    {tricks: 6, suit: null, points: 120},
    {tricks: 8, suit: spades, points: 240},
    {tricks: 8, suit: clubs, points: 260},
    {tricks: 8, suit: diamonds, points: 280},
    {tricks: 8, suit: hearts, points: 300},
    {tricks: 8, suit: null, points: 320},
    {tricks: 10, suit: spades, points: 440},
    {tricks: 10, suit: clubs, points: 460},
    {tricks: 10, suit: diamonds, points: 480},
    {tricks: 10, suit: hearts, points: 500},
    {tricks: 10, suit: null, points: 520},
];
describe('Scoring Avondale Unit', () => {
    describe('minTricks', () => {
        it('should be 6', () => {
            assert.equal(scoring.minTricks, 6);
        });
    });
    describe('maxTricks', () => {
        it('should be 10', () => {
            assert.equal(scoring.maxTricks, 10);
        });
    });
    describe('maxStandardBidPoints', () => {
        it('should be 520', () => {
            assert.equal(scoring.maxStandardBidPoints, 520);
        });
    });
    describe('calculateStandardBidPoints()', () => {
        for (const testBid of testBids) {
            it(`${testBid.tricks} ${testBid.suit ? testBid.suit.name : 'no trumps'} is ${testBid.points} points`, () => {
                assert.equal(scoring.calculateStandardBidPoints(testBid.tricks, testBid.suit), testBid.points);
            });
        }

    });
});
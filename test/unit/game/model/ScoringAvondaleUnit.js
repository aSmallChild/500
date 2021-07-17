/* eslint-disable */
import Bid from '../../../../src/game/model/Bid.js';
import OrdinaryNormalDeck from '../../../../src/game/model/OrdinaryNormalDeck.js';
// noinspection ES6UnusedImports
// import should from 'should';
import DeckConfig from '../../../../src/game/model/DeckConfig.js';
import ScoringAvondale from '../../../../src/game/model/ScoringAvondale.js';
import {expect} from 'chai';

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
describe('Scoring Avondale Unit', function() {
    describe('minTricks', function() {
        it('should be 6', function() {
            expect(scoring.minTricks).to.equal(6);
        });
    });
    describe('maxTricks', function() {
        it('should be 10', function() {
            expect(scoring.maxTricks).to.equal(10);
        });
    });
    describe('maxStandardBidPoints', function() {
        it('should be 520', function() {
            expect(scoring.maxStandardBidPoints).to.equal(520);
        });
    });
    describe('calculateStandardBidPoints()', function() {
        for (const testBid of testBids) {
            it(`${testBid.tricks} ${testBid.suit ? testBid.suit.name : 'no trumps'} is ${testBid.points} points`, function() {
                expect(scoring.calculateStandardBidPoints(testBid.tricks, testBid.suit)).to.equal(testBid.points);
            });
        }

    });
});
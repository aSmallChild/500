import Deck from '../../../../src/game/model/Deck.js';
import Card from '../../../../src/game/model/Card.js';
import OrdinaryNormalDeck from '../../../../src/game/constants/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../src/game/model/DeckConfig.js';
// noinspection ES6UnusedImports
import should from 'should';

const config = new DeckConfig(OrdinaryNormalDeck.getConfig());
const suits = config.suits;
const heart = suits.getSuit('♥');
const club = suits.getSuit('♣');
const spade = suits.getSuit('♠');

describe('Deck Unit', function() {
    describe('buildDeck()', function() {
        for (const c of [
            {
                totalHands: 2,
                _totalCards: 43,
                _lowestRedCard: 4,
                _highestRedCard: 10,
                _lowestBlackCard: 5,
                _highestBlackCard: 10,
            }, {
                totalHands: 3,
                _totalCards: 33,
                _lowestRedCard: 7,
                _highestRedCard: 10,
                _lowestBlackCard: 7,
                _highestBlackCard: 10,
            }, {
                totalHands: 4,
                _totalCards: 43,
                _lowestRedCard: 4,
                _highestRedCard: 10,
                _lowestBlackCard: 5,
                _highestBlackCard: 10,
            }, {
                totalHands: 5,
                _totalCards: 53,
                _lowestRedCard: 2,
                _highestRedCard: 10,
                _lowestBlackCard: 2,
                _highestBlackCard: 10,
            }, {
                totalHands: 6,
                _totalCards: 63,
                _lowestRedCard: 2,
                _highestRedCard: 13,
                _lowestBlackCard: 2,
                _highestBlackCard: 12,
            }, {
                totalHands: 17,
                _totalCards: 173,
                _lowestRedCard: 4,
                _highestRedCard: 4,
                _lowestBlackCard: 5,
                _highestBlackCard: 5,
            }, {
                totalHands: 42,
                _totalCards: 423,
                _lowestRedCard: 4,
                _highestRedCard: 4,
                _lowestBlackCard: 5,
                _highestBlackCard: 5,
            },
        ]) {
            const config = new DeckConfig(OrdinaryNormalDeck.getConfig());
            for (const x in c) {
                if (c.hasOwnProperty(x)) config[x] = c[x];
            }
            describe(`${config.totalHands} handed`, function() {
                const deck = Deck.buildDeck(config);
                it(`should have ${config._totalCards} cards`, function() {
                    deck.size.should.equal(config._totalCards);
                });
                it(`should have unique cards`, function() {
                    const cards = new Set();
                    for (const card of deck) {
                        cards.has(card.toString()).should.be.false(`deck contained a duplicate ${card.getName()}`);
                        cards.add(card.toString());
                    }
                });
            });
        }
    });

    function testShuffle(positionsToMove) {
        const config = new DeckConfig(OrdinaryNormalDeck.getConfig());
        config.totalHands = 5;
        const deck = Deck.buildDeck(config);
        const originalOrder = [];
        for (const card of deck) {
            originalOrder.push(card.toString());
        }
        deck.shuffle();
        let cardsThatDidntMoveVeryFar = 0;
        for (let i = 0; i < deck.size; i++) {
            const value = deck.cards[i].toString();
            for (let j = -positionsToMove; j <= positionsToMove; j++) {
                let index = i + j;
                if (index < 0) index = deck.size + index;
                index %= deck.size;
                if (originalOrder[index] === value) {
                    cardsThatDidntMoveVeryFar++;
                    break;
                }
            }
        }
        return cardsThatDidntMoveVeryFar / deck.size;
    }

    describe('shuffle()', function() {
        const minimumMovedPortion = 0.85;
        const positionsToMove = 2;
        const iterations = 100;
        it(`should have moved ${minimumMovedPortion * 100}% of the cards at least ${positionsToMove} positions`, function() {
            let unmovedPortion = 0;
            for (let i = 0; i < iterations; i++) {
                unmovedPortion += testShuffle(positionsToMove);
            }
            const averageUnmovedPortion = unmovedPortion / iterations;
            (averageUnmovedPortion).should.be.lessThan(1 - minimumMovedPortion, `in ${iterations} shuffles ${Math.round(averageUnmovedPortion * 1e4) / 1e2}% of cards did not move more than ${positionsToMove} positions`);
        });
    });

    describe('toString()', function() {
        it(`should produce a full deck`, function() {
            const config = new DeckConfig(OrdinaryNormalDeck.getConfig());
            config.totalHands = 5;
            const deck = Deck.buildDeck(config);
            (deck + '').should.equal('$♥AKQJ10-2♦AKQJ10-2♣AKQJ10-2♠AKQJ10-2');
        });
        it(`should produce correct ranges`, function() {
            const deck = new Deck([
                new Card(heart, 'A', config),
                new Card(heart, 'J', config),
                new Card(heart, 20, config),
                new Card(heart, 19, config),
                new Card(heart, 18, config),
                new Card(heart, 16, config),
                new Card(club, 3, config),
                new Card(spade, 5, config),
                new Card(spade, 4, config),
                new Card(spade, 3, config),
                new Card(spade, 2, config),
            ], config);
            deck.shuffle();
            (deck + '').should.equal('♥AJ20-18,16♣3♠5-2');
        });
    });

    describe('fromString()', function() {
        it(`should produce a full deck by default`, function() {
            const deck = Deck.fromString('$♥AKQJ10-2♦AKQJ10-2♣AKQJ10-2♠AKQJ10-2', config);
            (deck + '').should.equal('$♥AKQJ10-2♦AKQJ10-2♣AKQJ10-2♠AKQJ10-2');
        });
        it(`should produce correct ranges`, function() {
            const deck = Deck.fromString('♥AJ20-18,16♣3♠5-2', config);
            (deck + '').should.equal('♥AJ20-18,16♣3♠5-2');
        });
        it(`should not fail on that weird edge case where it didn't add all the commas`, function() {
            const deck = Deck.fromString('♥Q♦K10,6,5♣10,8,7♠10,7', config);
            (deck + '').should.equal('♥Q♦K10,6,5♣10,8,7♠10,7');
        });
    });
});

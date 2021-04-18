import Deck from '../../../../src/game/model/deck.js';
import Card from '../../../../src/game/model/card.js';
import Suit from '../../../../src/game/model/suit.js';
// noinspection ES6UnusedImports
import should from 'should';

describe('Deck Unit', function() {
    describe('buildDeck()', function() {
        for (const config of [
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
        const deck = Deck.buildDeck({totalHands: 5});
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
        it(`should produce a full deck by default`, function() {
            const deck = new Deck();
            (deck + '').should.equal('?♥AKQJ10-2♦AKQJ10-2♣AKQJ10-2♠AKQJ10-2');
        });
        it(`should produce correct ranges`, function() {
            const deck = new Deck([
                new Card(Suit.HEART, Card.ACE),
                new Card(Suit.HEART, Card.JACK),
                new Card(Suit.HEART, 20),
                new Card(Suit.HEART, 19),
                new Card(Suit.HEART, 18),
                new Card(Suit.HEART, 16),
                new Card(Suit.CLUB, 3),
                new Card(Suit.SPADE, 5),
                new Card(Suit.SPADE, 4),
                new Card(Suit.SPADE, 3),
                new Card(Suit.SPADE, 2),
            ]);
            deck.shuffle();
            (deck + '').should.equal('♥AJ20-18,16♣3♠5-2');
        });
    });
});
import Deck from '../../../../lib/game/model/Deck.js';
import Card from '../../../../lib/game/model/Card.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import assert from 'assert';

const config = new DeckConfig(OrdinaryNormalDeck.config);
const suits = config.suits;
const heart = suits.getSuit('H');
const club = suits.getSuit('C');
const spade = suits.getSuit('S');

describe('Deck Unit', () => {
    describe('buildDeck()', () => {
        for (const c of [
            {
                totalHands: 2,
                cardsPerHand: 20, // todo needs sorting out when two player is made
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
            }, {
                totalHands: 1,
                cardsPerHand: 1,
                kittySize: 1,
                _totalCards: 2,
            }, {
                totalHands: 1,
                cardsPerHand: 10,
                kittySize: 1,
                _totalCards: 11,
            }, {
                totalHands: 1,
                cardsPerHand: 17,
                kittySize: 1,
                _totalCards: 18,
            },
        ]) {
            const config = new DeckConfig(OrdinaryNormalDeck.config);
            for (const x in c) {
                if (c.hasOwnProperty(x)) config[x] = c[x];
            }
            describe(`${config.totalHands} handed`, () => {
                const deck = Deck.buildDeck(config);
                it(`should have ${config._totalCards} cards`, () => {
                    assert.equal(deck.size, config._totalCards);
                });
                it(`should have unique cards`, () => {
                    const cards = new Set();
                    for (const card of deck) {
                        assert(!cards.has(card.toString()), `deck contained a duplicate ${card.getName()}`);
                        cards.add(card.toString());
                    }
                });
            });
        }
    });

    function testShuffle(positionsToMove) {
        const config = new DeckConfig(OrdinaryNormalDeck.config);
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

    describe('shuffle()', () => {
        const minimumMovedPortion = 0.85;
        const positionsToMove = 2;
        const iterations = 100;
        it(`should have moved ${minimumMovedPortion * 100}% of the cards at least ${positionsToMove} positions`, () => {
            let unmovedPortion = 0;
            for (let i = 0; i < iterations; i++) {
                unmovedPortion += testShuffle(positionsToMove);
            }
            const averageUnmovedPortion = unmovedPortion / iterations;
            assert(averageUnmovedPortion < 1 - minimumMovedPortion, `in ${iterations} shuffles ${Math.round(averageUnmovedPortion * 1e4) / 1e2}% of cards did not move more than ${positionsToMove} positions`);
        });
    });

    describe('toString()', () => {
        it(`should produce a full deck`, () => {
            const config = new DeckConfig(OrdinaryNormalDeck.config);
            config.totalHands = 5;
            const deck = Deck.buildDeck(config);
            assert.equal(deck + '', '$HAKQJ10-2DAKQJ10-2CAKQJ10-2SAKQJ10-2');
        });
        it(`should produce correct ranges`, () => {
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
            assert.equal(deck + '', 'HAJ20-18,16C3S5-2');
        });
    });

    describe('fromString()', () => {
        it(`should produce a full deck by default`, () => {
            const deck = Deck.fromString('$HAKQJ10-2DAKQJ10-2CAKQJ10-2SAKQJ10-2', config);
            assert.equal(deck + '', '$HAKQJ10-2DAKQJ10-2CAKQJ10-2SAKQJ10-2');
        });
        it(`should produce correct ranges`, () => {
            const deck = Deck.fromString('HAJ20-18,16C3S5-2', config);
            assert.equal(deck + '', 'HAJ20-18,16C3S5-2');
        });
        it(`should not fail on that weird edge case where it didn't add all the commas`, () => {
            const deck = Deck.fromString('HQDK10,6,5C10,8,7S10,7', config);
            assert.equal(deck + '', 'HQDK10,6,5C10,8,7S10,7');
        });
    });

    describe('containsCard()', () => {
        it('should pass if deck contains card', () => {
            const deck = new Deck([
                new Card(heart, 'A', config),
            ]);
            const result = deck.containsCard(new Card(heart, 'A', config));
            assert(result);
        });

        it('should fail if deck does not contain card', () => {
            const deck = new Deck([
                new Card(spade, 'A', config),
                new Card(club, 'A', config),
                new Card(heart, 'K', config),
            ]);
            const result = deck.containsCard(new Card(heart, 'A', config));
            assert(!result);
        });
    });
});

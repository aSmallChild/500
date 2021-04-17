import Deck from '../../../../src/game/model/deck.js';
import Card from '../../../../src/game/model/card.js';
import should from 'should';

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
describe('shuffle()', function() {
    const deck = Deck.buildDeck({totalHands: 5});
    const originalOrder = [];
    for (const card of deck) {
        originalOrder.push(card.toString());
    }
    deck.shuffle();
    const minimumMovedPortion = 0.67;
    let cardsThatDidntMoveVeryFar = 0;
    const positionsToMove = 2;
    for (let i = 0; i < deck.size; i++) {
        const value = deck.cards[i].toString();
        for (let j = -positionsToMove; j <= positionsToMove; j++) {
            const index = (deck.size + j) % deck.size;
            if (originalOrder[index] === value) {
                cardsThatDidntMoveVeryFar++;
                break;
            }
        }
    }
    it(`should have moved ${minimumMovedPortion * 100}% of the cards at least ${positionsToMove} positions`, function() {
        (cardsThatDidntMoveVeryFar / deck.size).should.be.lessThan(1 - minimumMovedPortion, `${cardsThatDidntMoveVeryFar} out of ${deck.size} cards did not move more than ${positionsToMove} positions`);
    });
});
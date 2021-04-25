import Card from '../../../../src/game/model/Card.js';
import SuitCollection from '../../../../src/game/model/SuitCollection.js';
import OrdinaryNormalDeck from '../../../../src/game/constants/OrdinaryNormalDeck.js';
// noinspection ES6UnusedImports
import should from 'should';

const suits = new SuitCollection(OrdinaryNormalDeck.SUITS_HIGH_TO_LOW);
const testCards = [
    [new Card(null, Card.JOKER), Card.JOKER],
    [new Card(suits.getSuit('♣'), Card.QUEEN), `♣${Card.QUEEN}`],
    [new Card(suits.getSuit('♦'), 5), `♦5`],
    [new Card(suits.getSuit('♥'), 20), `♥20`],
];
describe('Card Unit', function() {
    describe('toString()', function() {
        it('should produce some strings', function() {
            for (const [card, str] of testCards) {
                str.should.equal(card + '', `${card.getName()} did not match ${card} != ${str}`);
            }
        });
    });
    describe('fromString()', function() {
        it('should produce some cards', function() {
            for (const [card, str] of testCards) {
                const newCard = Card.fromString(str, suits);
                (card.value === newCard.value).should.be.true(`card values do not match ${card.value} === ${newCard.value}`);
                (card.suit === newCard.suit).should.be.true(`card suits do not match ${card.suit} === ${newCard.suit}`);
            }
        });
    });
});

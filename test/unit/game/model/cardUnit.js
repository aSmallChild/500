import Card from '../../../../src/game/model/card.js';
import Suit from '../../../../src/game/model/suit.js';
// noinspection ES6UnusedImports
import should from 'should';

const testCards = [
    [new Card(null, Card.JOKER), Card.JOKER],
    [new Card(Suit.CLUB, Card.QUEEN), `${Suit.CLUB}${Card.QUEEN}`],
    [new Card(Suit.DIAMOND, 5), `${Suit.DIAMOND}5`],
    [new Card(Suit.HEART, 20), `${Suit.HEART}20`],
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
                const newCard = Card.fromString(str);
                (card.value === newCard.value).should.be.true(`card values do not match ${card.value} === ${newCard.value}`);
                (card.suit === newCard.suit).should.be.true(`card suits do not match ${card.suit} === ${newCard.suit}`);
            }
        });
    });
});

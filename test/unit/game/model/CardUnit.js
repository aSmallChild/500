import Card from '../../../../src/game/model/Card.js';
import OrdinaryNormalDeck from '../../../../src/game/constants/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../src/game/model/DeckConfig.js';
// noinspection ES6UnusedImports
import should from 'should';

const config = new DeckConfig(OrdinaryNormalDeck);
const testCards = [
    [new Card(null, '$', config), '$'],
    [new Card(config.suits.getSuit('♣'), 'Q', config), `♣Q`],
    [new Card(config.suits.getSuit('♦'), 5, config), `♦5`],
    [new Card(config.suits.getSuit('♥'), 20, config), `♥20`],
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
                const newCard = Card.fromString(str, config);
                (card.value === newCard.value).should.be.true(`card values do not match ${card.value} === ${newCard.value}`);
                (card.suit === newCard.suit).should.be.true(`card suits do not match ${card.suit} === ${newCard.suit}`);
            }
        });
    });
});

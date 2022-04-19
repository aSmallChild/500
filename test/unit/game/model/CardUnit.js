import Card from '../../../../lib/game/model/Card.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import assert from 'assert';

const config = new DeckConfig(OrdinaryNormalDeck.config);
const testCards = [
    [new Card(null, '$', config), '$'],
    [new Card(config.suits.getSuit('C'), 'Q', config), `CQ`],
    [new Card(config.suits.getSuit('D'), 5, config), `D5`],
    [new Card(config.suits.getSuit('H'), 20, config), `H20`],
];
describe('Card Unit', function() {
    describe('toString()', function() {
        it('should produce some strings', function() {
            for (const [card, str] of testCards) {
                assert.equal(str, card + '', `${card.getName()} did not match ${card} != ${str}`);
            }
        });
    });
    describe('fromString()', function() {
        it('should produce some cards', function() {
            for (const [card, str] of testCards) {
                const newCard = Card.fromString(str, config);
                assert(card.value === newCard.value, `card values do not match ${card.value} === ${newCard.value}`);
                assert(card.suit === newCard.suit, `card suits do not match ${card.suit} === ${newCard.suit}`);
            }
        });
    });
});

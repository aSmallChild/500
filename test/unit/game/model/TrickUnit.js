import assert from 'assert';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import Trick from '../../../../lib/game/model/Trick.js';
import Card from '../../../../lib/game/model/Card.js';

const config = new DeckConfig(OrdinaryNormalDeck.config);
const suits = config.suits;
const heart = suits.getSuit('H');
const diamond = suits.getSuit('D');
const club = suits.getSuit('C');
const spade = suits.getSuit('S');

describe('Trick Unit', () => {
    describe('playCard', () => {
        it('initial play of card sets trumps', () => {
            const trick = new Trick(3);
            const card = new Card(heart, 'A', config);
            trick.playCard(card);
            assert.equal(trick.trumps, heart);
        });

        it('exceeds expected max plays', () => {
            const trick = new Trick(1);
            const card = new Card(heart, 'A', config);
            trick.playCard(card);
            assert.throws(() => trick.playCard(card), Error);
        });

        const winningPlays = [
            [new Card(heart, '5', config), new Card(heart, '10', config)],
            [new Card(heart, 'Q', config), new Card(heart, 'K', config)],
            [new Card(heart, 'Q', config), new Card(heart, 'K', config)],
            [new Card(heart, 'A', config), new Card(heart, 'J', config)],
            [new Card(heart, 'A', config), new Card(diamond, 'J', config)],
            [new Card(club, 'A', config), new Card(spade, 'J', config)],
        ];

        for (const [card, winningCard] of winningPlays) {
            it(`replaces card ${card.value} with winning card ${winningCard.value}`, () => {
                const trick = new Trick(2);
                trick.playCard(card);
                trick.playCard(winningCard);
                assert.equal(trick.winningCard, winningCard);
            });
        }

        it('joker cannot beat winning joker', () => {
            const trick = new Trick(2);
            const initialCard = new Card(heart, '$', config);
            const nextCard = new Card(heart, '$', config);
            trick.playCard(initialCard);
            trick.playCard(nextCard);
            assert.equal(trick.winningCard, initialCard);
        });

        it('left bower cannot beat right bower', () => {
            const trick = new Trick(2);
            const initialCard = new Card(heart, 'J', config);
            const nextCard = new Card(diamond, 'J', config);
            trick.playCard(initialCard);
            trick.playCard(nextCard);
            assert.equal(trick.winningCard, initialCard);
        });
    });

    describe('endTrick', () => {
        it('returns winning card', () => {
            const trick = new Trick(2);
            const initialCard = new Card(heart, '2', config);
            trick.playCard(initialCard);
            const winningCard = trick.endTrick();
            assert.equal(winningCard, initialCard);
        });
    });
});

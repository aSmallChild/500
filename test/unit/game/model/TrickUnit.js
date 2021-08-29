// noinspection ES6UnusedImports
import should from 'should';

import OrdinaryNormalDeck from '../../../../src/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../src/game/model/DeckConfig.js';
import Trick from '../../../../src/game/model/Trick.js';
import Card from '../../../../src/game/model/Card.js';

const config = new DeckConfig(OrdinaryNormalDeck.config)
const suits = config.suits;
const heart = suits.getSuit('H');
const diamond = suits.getSuit('D');
const club = suits.getSuit('C');
const spade = suits.getSuit('S');

describe('Trick Unit', () => {
    describe('playCard', () => {
        it('initial play of card sets trumps', () => {
            // Arrange
            const trick = new Trick(3);
            const card = new Card(heart, 'A', config);

            // Act
            trick.playCard(card);

            // Assert
            trick.trumps.should.equal(heart);
        });

        it('exceeds expected max plays', () => {
            // Arrange
            const trick = new Trick(1);
            const card = new Card(heart, 'A', config);
            trick.playCard(card);

            // Act
            // Assert
            should.throws(() => trick.playCard(card), Error);
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
                // Arrange
                const trick = new Trick(2);
                trick.playCard(card);

                // Act
                trick.playCard(winningCard);

                // Assert
                trick.winningCard.should.equal(winningCard);
            });
        }

        it('joker cannot beat winning joker', () => {
            // Arrange
            const trick = new Trick(2);
            const initialCard = new Card(heart, '$', config);
            const nextCard = new Card(heart, '$', config);
            trick.playCard(initialCard);

            // Act
            trick.playCard(nextCard);

            // Assert
            trick.winningCard.should.equal(initialCard);
        });

        it('left bower cannot beat right bower', () => {
            // Arrange
            const trick = new Trick(2);
            const initialCard = new Card(heart, 'J', config);
            const nextCard = new Card(diamond, 'J', config);
            trick.playCard(initialCard);

            // Act
            trick.playCard(nextCard);

            // Assert
            trick.winningCard.should.equal(initialCard);
        });
    });

    describe('endTrick', () => {
        it('returns winning card', () => {
            // Arrange
            const trick = new Trick(2);
            const initialCard = new Card(heart, '2', config);
            trick.playCard(initialCard);

            // Act
            const winningCard = trick.endTrick();

            // Assert
            winningCard.should.equal(initialCard);
        });
    });
});

import Card from "./Card.js";
import CardRanking from "./CardRanking.js";
import Suit from "./Suit.js";

export default class Trick {
    /**
     * Sets up with the opening suit of the trick and
     * the expected number of cards to be played
     * @param {boolean} noTrumps
     * @param {number} maxPlays
     */
    constructor(maxPlays, noTrumps = false) {
        this.#setTrumps(noTrumps ? Suit.NO_TRUMPS : null);
        this.maxPlays = maxPlays;
        this.playedCards = [];
        this.winningCard = null;
    }

    playCard(card) {
        if (this.playedCards.length >= this.maxPlays) {
            throw new Error("trick has already reached it's expected maximum number of plays");
        }

        // TODO: Check for duplicate card being played

        // If leading card and not no trumps set trumps to be opening suit
        if (!this.winningCard && this.trumps != Suit.NO_TRUMPS) {
            this.#setTrumps(card.suit);
        }

        if (this.#isHigherThanWinningCard(card)) {
            this.winningCard = card;
        }

        this.playedCards = [...this.playedCards, card];
    }

    endTrick() {
        return this.winningCard;
    }

    /**
     * 
     * @param {?Suit} suit 
     */
    #setTrumps(suit) {
        if (suit == null) return;
        
        this.trumps = suit;
        this.cardRankings = new CardRanking(suit).lowToHighCardRanking;
    }

    #isHigherThanWinningCard(card) {
        if (!this.winningCard) return true;

        // Compares cards based on value taking into account bowers
        return this.#isGreaterCardValue(card);
    }

    /**
     * 
     * @param {Card} card 
     * @returns boolean
     */
    #isGreaterCardValue(card) {
        const cardValue = this.#trumpAdjustedValue(card);
        const winningCardValue = this.#trumpAdjustedValue(this.winningCard);

        return cardValue > winningCardValue
    }

    #trumpAdjustedValue(card) {
        if (!this.#isBower(card)) {
            return this.cardRankings.indexOf(card.value);
        }

        // Right bower
        if (card.suit == this.trumps) {
            return 1000; // TODO: pull value from card ranking:
        }

        // Left bower
        if (card.suit.isRed() && this.trumps.isRed()) {
            return 100; // TODO: pull value from card ranking
        }
        
        if (card.suit.isBlack() && this.trumps.isBlack()) {
            return 100; // TODO: pull value from card ranking
        }
    }

    #isBower(card) {
        return card.isJack();
    }
}

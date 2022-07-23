import {getCardSuit} from './cardValue.js';

export default function isFollowingSuit(card, hand, cardsPlayed, previousRounds, trumpSuit) {
    if (!cardsPlayed.length) {
        return true;
    }

    if (hand.length < 1 || hand.indexOf(card) < 0) {
        return false; // doesn't have anything to do with following suit
    }

    if (hand.length == 1) {
        return true;
    }

    const cardSuit = getCardSuit(card, trumpSuit);
    const leadingSuit = getCardSuit(cardsPlayed[0][0], trumpSuit);
    if (cardSuit == leadingSuit) {
        return true;
    }

    for (const alternativeCard of hand) {
        const alternativeSuit = getCardSuit(alternativeCard, trumpSuit);
        if (alternativeSuit == leadingSuit) {
            return false;
        }
    }

    return true;
}
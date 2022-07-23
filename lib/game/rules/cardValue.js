export function isTrump(card, trumpSuit = null) {
    if (!trumpSuit) {
        return false;
    }

    if (card.isSpecialCard()) {
        return true;
    }

    return card.suit == trumpSuit || card.suit.color == trumpSuit.color && card.isLowestPictureCard();
}

export function getCardSuit(card, trumpSuit) {
    return isTrump(card, trumpSuit) ? trumpSuit : card.suit;
}

export function compareCards(a, b, leadingSuit = null, trumpSuit = null) {
    if (a.isSpecialCard()) {
        return 1;
    }

    if (b.isSpecialCard()) {
        return -1;
    }

    if (trumpSuit) {
        const aIsTrump = isTrump(a, trumpSuit);
        const bIsTrump = isTrump(b, trumpSuit);

        if (aIsTrump > bIsTrump) {
            return 1;
        }

        if (aIsTrump < bIsTrump) {
            return -1;
        }

        if (aIsTrump && bIsTrump) {
            const aIsJack = a.isLowestPictureCard();
            const bIsJack = b.isLowestPictureCard();
            if (aIsJack && bIsJack) {
                return a.suit == trumpSuit ? 1 : -1;
            }

            if (aIsJack > bIsJack) {
                return 1;
            }

            if (aIsJack < bIsJack) {
                return -1;
            }
        }
    }

    const aIsLeadingSuit = a.suit == leadingSuit;
    const bIsLeadingSuit = b.suit == leadingSuit;
    if (aIsLeadingSuit > bIsLeadingSuit) {
        return 1;
    }

    if (aIsLeadingSuit < bIsLeadingSuit) {
        return -1;
    }

    if (a.suit == b.suit) {
        const aIsPicture = a.isPictureCard();
        const bIsPicture = b.isPictureCard();
        if (!aIsPicture && !bIsPicture) {
            return a.value > b.value ? 1 : -1;
        }

        if (aIsPicture > bIsPicture) {
            return 1;
        }

        if (aIsPicture < bIsPicture) {
            return -1;
        }

        return a.getPictureIndex() < b.getPictureIndex() ? 1 : -1;
    }

    return a.getSuitIndex() < b.getSuitIndex() ? 1 : -1;
}
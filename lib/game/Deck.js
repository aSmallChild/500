import Card from './model/Card.js';

export function buildDeck(config) {
    const suits = config.suits;
    const totalHands = config.totalHands;
    const kittySize = config.kittySize;
    const cardsPerHand = config.cardsPerHand;
    const pictureCards = config.suitPictureCards;
    const totalCards = totalHands * cardsPerHand + kittySize;
    const totalPictureCards = Math.max(0, Math.min(totalCards - config.specialCards.length, pictureCards.length * suits.length));
    const pictureCardsPerSuit = Math.floor(totalPictureCards / suits.length);
    let unallocatedPictureCards = totalPictureCards % suits.length;
    const totalNumberCards = Math.max(0, totalCards - (totalPictureCards + config.specialCards.length));
    const numberCardsPerSuit = Math.floor(totalNumberCards / suits.length);
    let unallocatedNumberCards = totalNumberCards % suits.length;

    const cards = [];
    for (const specialCard of config.specialCards) {
        cards.push(new Card(null, specialCard.symbol, config));
    }
    if (cards.length >= totalCards) {
        if (cards.length > totalCards) {
            cards.splice(totalCards);
        }
        return cards;
    }

    for (const suit of suits) {
        buildSuitPictureCards(suit, config, pictureCards, cards, pictureCardsPerSuit + (unallocatedPictureCards-- > 0));
        const numberCardsForThisSuit = numberCardsPerSuit + (unallocatedNumberCards-- > 0);
        if (numberCardsForThisSuit < 1) {
            continue;
        }
        const [lowest, highest] = getStartEndNumberCards(numberCardsForThisSuit);
        buildSuitNumberCards(suit, config, lowest, highest, cards);
    }

    return cards;
}

export function shuffle(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const newIndex = Math.floor(Math.random() * (i + 1));
        const cardToSwap = cards[newIndex];
        cards[newIndex] = cards[i];
        cards[i] = cardToSwap;
    }
}

export function deal(cards, numberOfCards) {
    numberOfCards = Math.min(cards.length, Math.abs(numberOfCards));
    return cards.splice(cards.length - numberOfCards);
}

export function containsCard(cards, card) {
    return cards.some(c => c == card || c.suit === card.suit && c.value === card.value);
}

export function cardsToString(cards, config) {
    if (!cards.length) return '';
    cards = [...cards];
    cards.sort((a, b) => compareCards(b, a, config));
    let str = '';
    let i = 0;
    while (!cards[i].suit) {
        str += cards[i].value;
        i++;
    }
    let previousValue;
    const consecutiveNumbers = [];
    const applyRange = () => {
        const r = consecutiveNumbers.splice(0, consecutiveNumbers.length);
        if (!r.length) return '';
        let str = typeof previousValue === 'number' ? ',' : '';
        previousValue = r[r.length - 1];
        if (r.length < 3) return str + r.join(',');
        str += r[0] + '-' + previousValue;
        return str;
    };
    for (const suit of config.suits) {
        let suitStr = '';
        previousValue = null;
        while (i < cards.length && cards[i].suit.symbol === suit.symbol) {
            const card = cards[i++];
            if (typeof card.value === 'number') {
                const lastNumberInRange = consecutiveNumbers[consecutiveNumbers.length - 1];
                if (consecutiveNumbers.length && lastNumberInRange - 1 !== card.value && lastNumberInRange + 1 !== card.value) {
                    suitStr += applyRange();
                }
                consecutiveNumbers.push(card.value);
            }
            else {
                suitStr += card.value;
                previousValue = card.value;
            }
        }
        if (suitStr || consecutiveNumbers.length) str += suit.symbol + suitStr + applyRange();
    }
    return str;
}

export function cardsFromString(str, config) {
    const cards = [];
    let suit = null, previousValue = null;
    for (let x of str.match(/(\d+|.)/g)) {
        if (config.getSymbolIndex(config.specialCards, x) >= 0) cards.push(new Card(null, x, config));
        else if (config.suits.symbols.indexOf(x) >= 0) suit = config.suits.getSuit(x);
        else if (x === '-' || x === ',') previousValue = x;
        else if (previousValue === '-') {
            let value = cards[cards.length - 1].value;
            const increment = x > value ? 1 : -1;
            for (value += increment; increment > 0 ? x >= value : x <= value; value += increment) {
                cards.push(new Card(suit, value, config));
            }
            previousValue = value;
        }
        else {
            const number = parseInt(x);
            if (!isNaN(number)) x = number;
            cards.push(new Card(suit, x, config));
            previousValue = x;
        }
    }
    return cards;
}

export function compareCards(a, b, config) {
    const aSpecialIndex = a.getSpecialIndex();
    const bSpecialIndex = b.getSpecialIndex();
    if (aSpecialIndex >= 0 && bSpecialIndex >= 0) return bSpecialIndex - aSpecialIndex;
    if (aSpecialIndex >= 0) return 1;
    if (bSpecialIndex >= 0) return -1;

    const suits = config.suits;
    const aSuitIndex = suits.symbols.indexOf(a.suit.symbol);
    const bSuitIndex = suits.symbols.indexOf(b.suit.symbol);
    if (aSuitIndex < bSuitIndex) return 1;
    if (aSuitIndex > bSuitIndex) return -1;

    if (a.value === b.value) return 0; // the cards are unequal in any further case

    const aPictureIndex = a.getPictureIndex();
    const bPictureIndex = b.getPictureIndex();
    if (aPictureIndex >= 0 && bPictureIndex < 0) return 1;
    if (bPictureIndex >= 0 && aPictureIndex < 0) return -1;
    if (aPictureIndex >= 0 && bPictureIndex >= 0) return aPictureIndex < bPictureIndex ? 1 : -1;

    // number cards
    return a.value > b.value ? 1 : -1;
}

export function getStartEndNumberCards(numberOfNumberCards = 9) {
    let lowest = 2;
    let highest = 10;
    const target = highest - lowest + 1;
    if (numberOfNumberCards < target) lowest += target - numberOfNumberCards;
    if (numberOfNumberCards > target) highest += numberOfNumberCards - target;
    return [lowest, highest];
}

export function buildSuitPictureCards(suit, config, pictureCards, cards = [], limit = pictureCards.length) {
    let count = 0;
    if (count === limit) {
        return cards;
    }
    for (const card of pictureCards) {
        cards.push(new Card(suit, card.symbol, config));
        if (++count === limit) {
            return cards;
        }
    }
    return cards;
}

export function buildSuitNumberCards(suit, config, lowest, highest, cards = []) {
    for (let i = highest; i >= lowest; i--) {
        cards.push(new Card(suit, i, config));
    }
    return cards;
}
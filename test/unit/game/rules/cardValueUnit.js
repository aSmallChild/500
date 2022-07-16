import {compareCards} from '../../../../lib/game/rules/cardValue.js';
import Card from '../../../../lib/game/model/Card.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import assert from 'assert';

const tests = [
    [['$', 'H5', 'C', 'H', 1], 'A is Joker'],
    [['HJ', '$', 'C', 'H', -1], 'B is Joker'],
    [['H4', 'C4', 'C', 'H', 1], 'A is trumps'],
    [['C4', 'H4', 'C', 'H', -1], 'B is trumps'],
    [['HJ', 'DJ', 'C', 'H', 1], 'A is Right Bower, both Bowers'],
    [['DJ', 'HJ', 'C', 'H', -1], 'B is Right Bower, both Bowers'],
    [['HJ', 'HA', 'C', 'H', 1], 'A Right Bower higher than Ace'],
    [['HA', 'DJ', 'C', 'H', -1], 'B Left Bower higher than Ace'],
    [['C5', 'D5', 'C', null, 1], 'A follows suit'],
    [['D5', 'C5', 'C', null, -1], 'B follows suit'],
    [['DA', 'C5', 'C', null, -1], 'B follows suit beats ace of other suit'],
    [['DJ', 'C5', 'C', null, -1], 'B follows suit beats jack of other suit'],
    [['CA', 'C5', 'C', null, 1], 'A is picture card'],
    [['S100', 'SA', 'C', null, -1], 'B is picture card'],
    [['S100', 'S10', 'S', null, 1], 'A higher number'],
    [['S1', 'S2', 'S', null, -1], 'B higher number'],
    [['SA', 'SK', 'S', null, 1], 'A higher picture'],
    [['SJ', 'SQ', 'S', null, -1], 'B higher picture'],
    [['H5', 'C5', 'S', null, 1], 'A higher suit'],
    [['C5', 'D5', 'S', null, -1], 'B higher suit'],
];

const config = new DeckConfig(OrdinaryNormalDeck.config);

function testCompareCards(a, b, leadingSuit, trumpSuit, expected) {
    a = Card.fromString(a, config);
    b = Card.fromString(b, config);
    if (leadingSuit) {
        leadingSuit = config.suits.getSuit(leadingSuit);
    }
    if (trumpSuit) {
        trumpSuit = config.suits.getSuit(trumpSuit);
    }
    assert.equal(compareCards(a, b, leadingSuit, trumpSuit), expected);
}

describe('compareCards()', () => {
    for (const [args, name] of tests) {
        it(name, () => testCompareCards(...args));
    }
});

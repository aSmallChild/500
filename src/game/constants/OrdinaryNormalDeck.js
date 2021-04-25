export default class OrdinaryNormalDeck {
    static SUITS_HIGH_TO_LOW = [
        '♥:Heart',
        '♦:Diamond',
        '♣:Club',
        '♠:Spade',
    ];

    static SPECIAL_CARDS_HIGH_TO_LOW = [
        '$:Joker',
    ];

    static SUIT_PICTURE_CARDS_HIGH_TO_LOW = [
        'A:Ace',
        'K:King',
        'Q:Queen',
        'J:Jack',
    ];

    static SPECIAL_BIDS_HIGH_TO_LOW = [
        'B:1000:Blind Misere',
        'O:500:Open Misere',
        'M:250:Closed Misere',
    ];
}
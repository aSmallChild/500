export default class OrdinaryNormalDeck {
    static getConfig() {
        return {
            SUITS_HIGH_TO_LOW: [
                '♥:Heart',
                '♦:Diamond',
                '♣:Club',
                '♠:Spade',
            ],
            SPECIAL_CARDS_HIGH_TO_LOW: [
                '$:Joker',
            ],
            SUIT_PICTURE_CARDS_HIGH_TO_LOW: [
                'A:Ace',
                'K:King',
                'Q:Queen',
                'J:Jack',
            ],
            SPECIAL_BIDS_HIGH_TO_LOW: [
                'B:1000:Blind Misere',
                'O:500:Open Misere',
                'M:250:Closed Misere',
            ],
        };
    }
}
export default class Suit {
    static HEART = '♥';
    static DIAMOND = '♦';
    static CLUB = '♣';
    static SPADE = '♠';
    static ALL = [Suit.HEART, Suit.DIAMOND, Suit.CLUB, Suit.SPADE];

    static getName(suit) {
        if (suit === Suit.HEART) return 'Heart';
        if (suit === Suit.DIAMOND) return 'Diamond';
        if (suit === Suit.CLUB) return 'Club';
        if (suit === Suit.SPADE) return 'Spade';
        return null;
    }
}
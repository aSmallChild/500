export default class OrdinaryNormalDeck {
    static get config() {
        return {
            SUITS_HIGH_TO_LOW: [
                'H:red:Heart',
                'D:red:Diamond',
                'C:black:Club',
                'S:black:Spade',
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
                'P:0:Pass',
            ],
        };
    }

    static get svgDefs() {
        return `
            <symbol id="H" viewBox="-600 -600 1200 1200">
                <path d="M0 -300C0 -400 100 -500 200 -500C300 -500 400 -400 400 -250C400 0 0 400 0 500C0 400 -400 0 -400 -250C-400 -400 -300 -500 -200 -500C-100 -500 0 -400 -0 -300Z"></path>
            </symbol>
            <symbol id="D" viewBox="-600 -600 1200 1200">
                <path d="M-400 0C-350 0 0 -450 0 -500C0 -450 350 0 400 0C350 0 0 450 0 500C0 450 -350 0 -400 0Z"></path>
            </symbol>
            <symbol id="C" viewBox="-600 -600 1200 1200">
                <path d="M30 150C35 385 85 400 130 500L-130 500C-85 400 -35 385 -30 150A10 10 0 0 0 -50 150A210 210 0 1 1 -124 -51A10 10 0 0 0 -110 -65A230 230 0 1 1 110 -65A10 10 0 0 0 124 -51A210 210 0 1 1 50 150A10 10 0 0 0 30 150Z"></path>
            </symbol>
            <symbol id="S" viewBox="-600 -600 1200 1200">
                <path d="M0 -500C100 -250 355 -100 355 185A150 150 0 0 1 55 185A10 10 0 0 0 35 185C35 385 85 400 130 500L-130 500C-85 400 -35 385 -35 185A10 10 0 0 0 -55 185A150 150 0 0 1 -355 185C-355 -100 -100 -250 0 -500Z"></path>
            </symbol>
        `;
    }

    static get layout() {
        return {
            width: 250,
            height: 350,
            margin: 8,
            pipSymbolSize: 30,
            symbolRowsMax: 4,
            symbolsColumnsMax: 3,
            symbolLayouts: [
                [[50, 50]],
                [[50, 0], [50, 100]],
                [[50, 0], [50, 50], [50, 100]],
                [[0, 0], [0, 100], [100, 0], [100, 100]],
                [[0, 0], [0, 100], [100, 0], [100, 100], [50, 50]],
                [[0, 0], [0, 50], [0, 100], [100, 0], [100, 50], [100, 100]],
                [[0, 0], [0, 50], [0, 100], [100, 0], [100, 50], [100, 100], [50, 25]],
                [[0, 0], [0, 50], [0, 100], [100, 0], [100, 50], [100, 100], [50, 25], [50, 75]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [50, 50], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [50, 100 / 6], [50, 500 / 6], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [50, 100 / 6], [50, 50], [50, 500 / 6], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [50, 0], [50, 100 / 3], [50, 200 / 3], [50, 100], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [50, -100 / 6], [50, 100 / 6], [50, 50], [50, 500 / 6], [50, 700 / 6], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [25, 100 / 6], [50, 0], [50, 100 / 3], [50, 200 / 3], [50, 100], [75, 500 / 6], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [25, 100 / 6], [25, 50], [50, 0], [50, 100 / 3], [50, 200 / 3], [50, 100], [75, 500 / 6], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [25, 100 / 6], [25, 50], [50, 0], [50, 100 / 3], [50, 200 / 3], [50, 100], [75, 50], [75, 500 / 6], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [25, 100 / 6], [25, 50], [50, 0], [50, 100 / 3], [50, 200 / 3], [50, 100], [75, 100 / 6], [75, 50], [75, 500 / 6], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
                [[0, 0], [0, 100 / 3], [0, 200 / 3], [0, 100], [25, 100 / 6], [25, 50], [25, 500 / 6], [50, 0], [50, 100 / 3], [50, 200 / 3], [50, 100], [75, 100 / 6], [75, 50], [75, 500 / 6], [100, 0], [100, 100 / 3], [100, 200 / 3], [100, 100]],
            ],
            getSymbolArea() {
                const horizontalMargin = this.margin * 4 + this.pipSymbolSize;
                const verticalMargin = this.margin + this.pipSymbolSize / 2;
                return {
                    horizontalMargin,
                    verticalMargin,
                    width: this.width - horizontalMargin * 2,
                    height: this.width - verticalMargin * 2,
                };
            },
            getSymbolSize() {
                const area = this.getSymbolArea();
                const availableHeight = area.height - (this.symbolRowsMax - 1) * this.margin;
                const symbolHeight = availableHeight / this.symbolRowsMax;
                const availableWidth = area.width - (this.symbolsColumnsMax - 1) * this.margin;
                const symbolWidth = availableWidth / this.symbolsColumnsMax;
                return Math.max(symbolWidth, symbolHeight);
            },
            getSymbolMap(numberOfSymbols) {
                if (this.symbolLayouts.length < numberOfSymbols) {
                    return null;
                }
                return this.symbolLayouts[numberOfSymbols - 1];
            },
        };
    }
}
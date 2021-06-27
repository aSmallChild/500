export default class CardSVG {
    constructor(card, svg) {
        this.card = card;
        this.svg = svg;
        this.transforms = new Map();
        this.transformTimeout = null;
    }

    moveTo(x, y) {
        x = typeof x === 'number' ? x + 'px' : x;
        y = typeof y === 'number' ? y + 'px' : y;
        this.transforms.set('translateX', x);
        this.transforms.set('translateY', y);
        this._updateTransform();
    }

    rotate(angle) {
        angle = typeof angle === 'number' ? angle + 'deg' : angle;
        this.transforms.set('rotate', angle);
        this._updateTransform();
    }

    resetTransform() {
        this.transforms.clear();
        this.transformInstantly();
    }

    transformInstantly() {
        clearTimeout(this.transformTimeout);
        this.svg.style.transition = 'none';
        this.svg.style.transform = this._getTransformValue();
        this.transformTimeout = setTimeout(() => {
            this.svg.style.transition = '';
        }, 100);
    }

    _getTransformValue() {
        let newTransformValue = '';
        for (const [key, value] of this.transforms.entries()) {
            newTransformValue += ` ${key}(${value})`;
        }
        return newTransformValue;
    }

    _updateTransform() {
        this.transformTimeout = setTimeout(() => {
            this.svg.style.transform = this._getTransformValue();
        }, 1);
    }
}
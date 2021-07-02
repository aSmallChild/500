export default class CardSVG {
    constructor(card, svg) {
        this.card = card;
        this.svg = svg;
        this.svg.cardSvg = this;
        this.transforms = new Map();
        this.transformTimeout = null;
    }

    moveTo(x, y) {
        x = typeof x === 'number' ? x + 'px' : x;
        y = typeof y === 'number' ? y + 'px' : y;
        this.transforms.set('translateX', x);
        this.transforms.set('translateY', y);
    }

    rotate(angle) {
        angle = typeof angle === 'number' ? angle + 'deg' : angle;
        this.transforms.set('rotate', angle);
    }

    resetTransform() {
        this.transforms.clear();
        this.instantTransform();
    }

    _getTransformValue() {
        let newTransformValue = '';
        for (const [key, value] of this.transforms.entries()) {
            newTransformValue += ` ${key}(${value})`;
        }
        return newTransformValue;
    }

    instantTransform(value) {
        this.svg.style.transition = 'none';
        this.transform(value);
    }

    animateTransform(value) {
        clearTimeout(this.transformTimeout);
        this.transformTimeout = setTimeout(() => {
            this.svg.style.transition = '';
            this.transform(value);
        }, 1);
    }

    transform(value) {
        this.svg.style.transform = value ?? this._getTransformValue();
    }

    animateTo(setPosition) {
        const originalPosition = this.svg.getBoundingClientRect();
        this.svg.parentElement.removeChild(this.svg);
        this.svg.style.visibility = 'hidden';
        setPosition();
        const newPosition = this.svg.getBoundingClientRect();
        const x = originalPosition.right - newPosition.right;
        const y = originalPosition.top - newPosition.top;
        this.moveTo(x, y);
        this.rotate(-360 * 3);
        this.instantTransform();
        this.svg.style.visibility = '';
        this.moveTo(0, 0);
        this.rotate(0);
        this.animateTransform();
    }

    animateSiblings(setPosition) {
        const originalSiblingPositions = [];
        let nextSibling = this.svg.nextSibling;
        while (nextSibling) {
            if (!nextSibling.cardSvg) {
                debugger;
                nextSibling = nextSibling.nextSibling;
                continue;
            }
            const originalPosition = nextSibling.getBoundingClientRect();
            originalSiblingPositions.push({sibling: nextSibling, originalPosition});
            nextSibling = nextSibling.nextSibling;
        }
        const originalPosition = this.svg.getBoundingClientRect();
        this.svg.parentElement.removeChild(this.svg);
        for (const {sibling, originalPosition} of originalSiblingPositions) {
            const newPosition = sibling.getBoundingClientRect();
            const x = originalPosition.right - newPosition.right;
            const y = originalPosition.top - newPosition.top;
            if (x || y) {
                sibling.cardSvg.moveTo(x, y);
                sibling.cardSvg.instantTransform();
            }
        }
        this.svg.style.visibility = 'hidden';
        setPosition();
        const newPosition = this.svg.getBoundingClientRect();
        const x = originalPosition.right - newPosition.right;
        const y = originalPosition.top - newPosition.top;
        this.moveTo(x, y);
        this.rotate(-360 * 3);
        this.instantTransform();
        this.svg.style.display = 'none';
        const newSiblingPositions = [];
        nextSibling = this.svg.nextSibling;
        while (nextSibling) {
            if (!nextSibling.cardSvg) {
                nextSibling = nextSibling.nextSibling;
                continue;
            }
            const originalPosition = nextSibling.getBoundingClientRect();
            newSiblingPositions.push({sibling: nextSibling, originalPosition});
            nextSibling = nextSibling.nextSibling;
        }
        this.svg.style.display = '';
        this.svg.style.visibility = '';
        this.moveTo(0, 0);
        this.rotate(0);
        this.animateTransform();
        for (const {sibling} of originalSiblingPositions) {
            sibling.cardSvg.moveTo(0, 0);
            sibling.cardSvg.animateTransform();
        }

        for (const {sibling, originalPosition} of newSiblingPositions) {
            const newPosition = sibling.getBoundingClientRect();
            const x = originalPosition.right - newPosition.right;
            const y = originalPosition.top - newPosition.top;
            if (x || y) {
                sibling.cardSvg.moveTo(x, y);
                sibling.cardSvg.instantTransform();
                sibling.cardSvg.moveTo(0, 0);
                sibling.cardSvg.animateTransform();
            }
        }
    }
}
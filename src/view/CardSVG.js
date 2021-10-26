export default class CardSVG {
    constructor(card, svg) {
        this.card = card;
        this.svg = svg;
        this.svg.cardSvg = this;
    }

    static moveTo(x, y) {
        x = typeof x === 'number' ? x + 'px' : x;
        y = typeof y === 'number' ? y + 'px' : y;
        return `translateX(${x}) translateY(${y})`;
    }

    static rotate(angle) {
        angle = typeof angle === 'number' ? angle + 'deg' : angle;
        return `rotate(${angle})`;
    }

    instantTransform(transforms) {
        this.svg.style.transition = 'none';
        this.transform(transforms);
    }

    animateTransform(transforms) {
        return () => {
            this.svg.style.transition = '';
            this.transform(transforms);
        };
    }

    transform(transforms) {
        this.svg.style.transform = transforms.join(' ');
    }

    animateTo(setPosition) {
        const originalPosition = this.svg.getBoundingClientRect();
        if (this.svg.parentElement) {
            this.svg.parentElement.removeChild(this.svg);
        }
        this.svg.style.visibility = 'hidden';
        setPosition();
        const newPosition = this.svg.getBoundingClientRect();
        this.instantTransform([
            this.constructor.moveTo(originalPosition.right - newPosition.right, originalPosition.top - newPosition.top),
            this.constructor.rotate(-360 * 2),
        ]);
        this.svg.style.visibility = '';
        return this.animateTransform([]);
    }

    animateSiblings(setPosition) {
        // todo include previous siblings and avoid animating the same element twice if the card retains the same parent
        const originalSiblingPositions = [];
        let nextSibling = this.svg.nextSibling;
        while (nextSibling) {
            if (!nextSibling.cardSvg) {
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
        this.unfrozen.transforms.clear();
        this.animateTransform();
        for (const {sibling} of originalSiblingPositions) {
            sibling.cardSvg.unfrozen.transforms.clear();
            sibling.cardSvg.animateTransform();
        }

        for (const {sibling, originalPosition} of newSiblingPositions) {
            const newPosition = sibling.getBoundingClientRect();
            const x = originalPosition.right - newPosition.right;
            const y = originalPosition.top - newPosition.top;
            if (x || y) {
                sibling.cardSvg.moveTo(x, y);
                sibling.cardSvg.instantTransform();
                sibling.cardSvg.unfrozen.transforms.clear();
                sibling.cardSvg.animateTransform();
            }
        }
    }
}
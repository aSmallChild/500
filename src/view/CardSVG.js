export default class CardSVG {
    constructor(card, svg) {
        this.card = card;
        this.svg = svg;
    }

    static moveTo(x, y) {
        // x = typeof x === 'number' ? `${x}px` : x;
        // y = typeof y === 'number' ? `${y}px` : y;
        return `translateX(${x}px) translateY(${y}px)`;
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

    getCurrentRotationAndTranslation(transform) {
        if (!transform || transform === 'none') return [0, 0, 0];
        const [scaleX, skewY, , , tx, ty] = transform.replace('matrix(', '').replace(')', '').split(', ');
        return [Math.round(Math.atan2(skewY, scaleX) * (180 / Math.PI)), parseFloat(tx) || 0, parseFloat(ty) || 0];
    }

    animateTo(setPosition) {
        // todo debug this, suspect that animations sometimes don't happen because the translate X/Y are NaN
        const [originalRotation, tx, ty] = this.getCurrentRotationAndTranslation(window.getComputedStyle(this.svg).transform);
        this.svg.style.visibility = 'hidden';
        this.svg.style.transform = 'none'; // needs to happen before getting the position cause transforms will displace its bounding rect
        const originalPosition = this.svg.getBoundingClientRect();

        if (this.svg.parentElement) {
            // not having a parent element is what causes the cards to fly in from the top left because their originalPosition will be 0,0
            this.svg.parentElement.removeChild(this.svg);
        }

        setPosition();
        const newPosition = this.svg.getBoundingClientRect();
        this.instantTransform([
            this.constructor.moveTo(tx + originalPosition.right - newPosition.right, ty + originalPosition.top - newPosition.top),
            originalRotation ? this.constructor.rotate(originalRotation) : '',
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
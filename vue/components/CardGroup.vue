<template>
    <div ref="root" :a="cardSVGs" :class="{fan, 'animate-cards': animate}"></div>
</template>

<script>
import {computed, nextTick, ref} from 'vue';

export default {
    props: {
        cards: Array,
        fan: {
            type: Boolean,
            default: false
        },
        pile: {
            type: Boolean,
            default: false
        },
        animate: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {
        //todo write some random transforms for piles
        const root = ref(null);
        const hasSVG = svg => {
            for (const cardSvg of props.cards) {
                if (cardSvg.svg === svg) {
                    return true;
                }
            }
            return false;
        };
        const getCardsAlreadyPlaced = () => {
            if (!root.value.children) {
                return [];
            }
            const cardsAlreadyHere = [];
            try {
                for (const svg of root.value.children) {
                    if (hasSVG(svg)) {
                        cardsAlreadyHere.push(svg);
                    }
                }
            } catch (err) {
                console.error(err);
                console.error(root.value);
            }
            return cardsAlreadyHere;
        };
        const placeCards = () => {
            if (!root.value || !props.cards.length) return;
            const cardsAlreadyHere = getCardsAlreadyPlaced();
            const callbacks = [];
            let index = 0;
            for (const cardSvg of props.cards) {
                if (cardSvg.svg.parentElement !== root.value || cardsAlreadyHere[index] !== cardSvg.svg) {
                    callbacks.push(cardSvg.animateTo(() => root.value.appendChild(cardSvg.svg)));
                }
                index++;
            }
            if (!callbacks.length) return;
            nextTick(() => {
                setTimeout(() => {
                    for (const callback of callbacks) {
                        callback();
                    }
                }, 7);
            });
        };
        return {
            root,
            cardSVGs: computed(placeCards),
        };
    },
};
</script>
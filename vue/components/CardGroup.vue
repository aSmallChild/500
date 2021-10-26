<template>
    <div ref="root" :a="cardSVGs"></div>
</template>

<script>
import {computed, nextTick, onMounted, ref} from 'vue';

export default {
    props: {
        cards: Array,
    },
    setup(props) {
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
            root.value.children.forEach(svg => {
                if (hasSVG(svg)) {
                    cardsAlreadyHere.push(svg);
                }
            });
            return cardsAlreadyHere;
        };
        const placeCards = () => {
            // must access a property of cards prior to checking root.value or reactivity breaks
            if (!props.cards.length || !root.value) {
                return;
            }

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
            nextTick(() => setTimeout(() => callbacks.forEach(callback => callback()), 7));
        };
        onMounted(placeCards);
        return {
            root,
            cardSVGs: computed(placeCards),
        };
    },
};
</script>
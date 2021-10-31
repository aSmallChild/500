<template>
    <div ref="root" :a="cardSVGs" :class="{fan, 'animate-cards': animate}" @click.prevent="onClick"/>
</template>

<script>
import {computed, nextTick, ref} from 'vue';

export default {
    props: {
        cards: Array,
        fan: {
            type: Boolean,
            default: false,
        },
        pile: {
            type: Boolean,
            default: false,
        },
        animate: {
            type: Boolean,
            default: true,
        },
    },
    emits: [
        'card',
        'card-svg',
    ],
    setup(props, {emit}) {
        //todo write some random transforms for piles
        const root = ref(null);
        const findCardBySvg = svg => props.cards.find(card => card.svg === svg);
        const findCardByElement = ele => findCardBySvg(ele) || props.cards.find(card => card.svg.contains(ele));
        const getCardsAlreadyPlaced = () => {
            if (!root.value.children) {
                return [];
            }
            const cardsAlreadyHere = [];
            try {
                for (const svg of root.value.children) {
                    if (findCardBySvg(svg)) {
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
        const onClick = event => {
            console.log(event) //todo debug this
            if (event.target === root.value) return;
            const cardSvg = findCardByElement(event.target);
            if (cardSvg) {
                emit('card', cardSvg.card);
                emit('card-svg', cardSvg);
            }
        };
        return {
            root,
            cardSVGs: computed(placeCards),
            onClick,
        };
    },
};
</script>
<template>
    <div ref="root" :a="cardSVGs" :class="{fan, 'animate-cards': animate}"
         @click="onClick"
         @drop="onDrop"
         @dragstart="onDragStart"
         @dragover.prevent
         @dragenter.prevent
    />
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
        draggableCards: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'card',
        'card-svg',
        'card-id-drop',
        // todo might be useful to have a onCardLeave/dragend event so the parent knows where the card has come from
    ],
    setup(props, {emit}) {
        //todo write some random transforms for piles
        const root = ref(null);
        const findCardBySvg = svg => props.cards.find(card => card.svg === svg);
        const findCardByElement = ele => findCardBySvg(ele) || props.cards.find(card => card.svg.contains(ele));
        const getCardsAlreadyPlaced = () => {
            // note: there may be cards inside this component that don't belong here, the parent component is responsible for moving these
            // we don't know the order that each card will be moved in, it could be handled after this is run
            // and if we get rid of it here without knowing where to move it to, it will break animations
            // cards in this component that aren't in the prop are welcome to stay
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
        const onDragStart = event => {
            if (event.target === root.value) return;
            const cardSvg = findCardByElement(event.target);
            if (!cardSvg) return;
            event.dataTransfer.dropEffect = 'move';
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('card', cardSvg.card);
        };
        const onDrop = event => {
            const card = event.dataTransfer.getData('card');
            if (!card) return;
            emit('card-id-drop', card);
        };
        const onClick = event => {
            if (event.target === root.value) return;
            const cardSvg = findCardByElement(event.target);
            if (!cardSvg) return;
            emit('card', cardSvg.card);
            emit('card-svg', cardSvg);
        };
        const placeCards = () => {
            if (!root.value || !props.cards.length) return;
            const cardsAlreadyHere = getCardsAlreadyPlaced();
            const callbacks = [];
            for (let i = 0; i < props.cards.length; i++) {
                const cardSvg = props.cards[i];
                cardSvg.svg.setAttribute('draggable', props.draggableCards);
                if (cardSvg.svg.parentElement !== root.value || cardsAlreadyHere[i] !== cardSvg.svg) {
                    callbacks.push(cardSvg.animateTo(() => {
                        root.value.appendChild(props.cards[i].svg)
                    }));
                }
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
            onClick,
            onDrop,
            onDragStart
        };
    },
};
</script>
<template>
    <div :a="_cards"></div>
</template>

<script>
export default {
    props: {
        cards: Array,
    },
    computed: {
        _cards() {
            return this.placeCards();
        },
    },
    // watch: {
    //     cards: {
    //         handler() {
    //             this.placeCards();
    //         },
    //         immediate: true,
    //     },
    // },
    methods: {
        placeCards() {
            // must access a property of cards prior to checking this.$el or reactivity breaks
            if (!this.cards.length || !this.$el) {
                return;
            }

            const cardsAlreadyHere = this.getCardsAlreadyPlaced();
            const callbacks = [];
            this.cards.forEach((cardSvg, index) => {
                if (cardSvg.svg.parentElement === this.$el && cardsAlreadyHere[index] === cardSvg.svg) {
                    return;
                }
                callbacks.push(cardSvg.animateTo(() => this.$el.appendChild(cardSvg.svg)));
            });
            this.$nextTick(() => {
                setTimeout(() => callbacks.forEach(callback => callback()), 7);
            });
        },
        hasSVG(svg) {
            for (const cardSvg of this.cards) {
                if (cardSvg.svg === svg) {
                    return true;
                }
            }
            return false;
        },
        getCardsAlreadyPlaced() {
            if (!this.$el.children) {
                return [];
            }
            const cardsAlreadyHere = [];
            this.$el.children.forEach(svg => {
                if (this.hasSVG(svg)) {
                    cardsAlreadyHere.push(svg);
                }
            });
            return cardsAlreadyHere;
        },
    },
    mounted() {
        this.placeCards();
    },
};
</script>

<style lang="scss">

</style>
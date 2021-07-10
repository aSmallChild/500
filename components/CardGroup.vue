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
    methods: {
        placeCards() {
            // must access a property of cards prior to checking this.$el or reactivity breaks
            if (!this.cards.length || !this.$el) {
                return;
            }
            this.cards.forEach((cardSvg, index) => {
                if (cardSvg.svg.parentElement !== this.$el || this.$el.children[index] !== cardSvg.svg) {
                    cardSvg.animateTo(() => {
                        this.$el.appendChild(cardSvg.svg);
                    });
                }
            });
        },
    },
    mounted() {
        this.placeCards();
    },
};
</script>

<style lang="scss">

</style>
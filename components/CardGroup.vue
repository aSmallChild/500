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
            this.cards.forEach((cardSvg/*, index*/) => {
                // todo use the index to put cards in order
                if (this.$el && cardSvg.svg.parentElement !== this.$el) {
                    cardSvg.animateTo(() => {
                        this.$el.appendChild(cardSvg.svg);
                    });
                }
            });
            return 'a';
        },
    },
};
</script>

<style lang="scss">

</style>
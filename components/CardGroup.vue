<template>
    <div></div>
</template>

<script>
export default {
    props: {
        cards: Array
    },
    computed: {
        _cards() {
            this.cards.forEach((cardSvg/*, index*/) => {
                // todo use the index to put cards in order
                // todo if a card is moving remember its original position and animate
                if (cardSvg.svg.parentElement !== this.$el) {
                    this.$el.appendChild(cardSvg.svg);
                }
            });
            return true;
        }
    },
    methods: {
        hasCard(svg) {
            for (const cardSvg of this.cards) {
                if (cardSvg.svg === svg) {
                    return true;
                }
            }
            return false;
        },
        addCard(cardSvg) {
            if (!cardSvg.svg.parentElement) {
                this.$el.appendChild(cardSvg.svg);
                return;
            }
            cardSvg.animateSiblings(() => {
                this.$el.appendChild(cardSvg.svg);
            });
        },
    },
};
</script>

<style lang="scss">

</style>
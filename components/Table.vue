<template>
    <div class="table"></div>
</template>

<script>
export default {
    name: 'Table',
    methods: {
        playCard(cardSvg) {
            this.$el.appendChild(cardSvg.svg);
        }
    }
};
</script>

<style scoped>

</style>
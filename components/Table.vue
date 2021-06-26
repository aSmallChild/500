<template>
    <div ref="table" class="table"></div>
</template>

<script>
export default {
    name: 'Table',
    methods: {
        playCard(cardSvg) {
            this.$refs.table.appendChild(cardSvg.svg)
        }
    }
};
</script>

<style scoped>

</style>
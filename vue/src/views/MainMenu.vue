<template>
    <n-space justify="center" align="center" vertical class="main-menu full-height">
        <n-h1 strong>{{ pathNotFound ? 404 : 500 }}</n-h1>
        <router-link v-for="[label, route] of menuItems" :key="label" :to="route" custom v-slot="{ navigate }">
            <n-button block strong type="primary" @click="navigate" size="large">{{ label }}</n-button>
        </router-link>
    </n-space>
</template>

<script setup>
import {useRoute} from 'vue-router';
import {NButton, NSpace, NH1} from 'naive-ui';

const route = useRoute();
const pathNotFound = route.params.pathNotFound || null;
const menuItems = [
    ['New', 'new'],
    ['Join', 'join'],
    ['Sandbox', 'sandbox'],
];
</script>

<style lang="scss">
.main-menu {
    text-align: center;

    & > * {
        width: 12rem;
    }
}
</style>
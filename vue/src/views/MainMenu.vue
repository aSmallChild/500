<template>
    <div class="menu">
        <div class="menu-buttons">
            <h1>{{ pathNotFound ? 404 : 500 }}</h1>
            <n-button type="primary" v-for="[label, route] of menuItems" :key="label" @click="$router.push(route)">{{ label }}</n-button>
        </div>
    </div>
</template>

<script>
import {useRoute} from 'vue-router';
import {NButton} from 'naive-ui';

export default {
    components: {
        NButton,
    },
    setup() {
        const route = useRoute();
        return {
            pathNotFound: route.params.pathNotFound || null,
            menuItems: [
                ['New', 'new'],
                ['Join', 'join'],
                ['Sandbox', 'sandbox'],
            ],
        };
    },
};
</script>

<style lang="scss" scoped>
.menu {
    height: 100%;
    display: flex;
}

.menu-buttons {
    & > h1 {
        text-align: center;
    }

    & > * {
        margin: 10px auto;
        min-width: 200px;
        max-width: 300px;
        width: 50%;
    }

    & > .v-btn {
        display: block;
    }
}
</style>
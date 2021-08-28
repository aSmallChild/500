<template>
    <v-container class="menu">
        <v-row align="center" justify="center">
            <v-col>
                <div class="menu-buttons">
                    <h1>500</h1>
                    <v-btn v-for="[label, route] of Object.entries(menuItems)" :key="label"
                           color="secondary" @click="$router.push(route)">
                        {{ label }}
                    </v-btn>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'MainMenu',
    data() {
        return {
            menuItems: {
                'New': 'new',
                'Join': 'join',
                'Sandbox': 'sandbox',
            },
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
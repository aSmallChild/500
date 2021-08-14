<template>
    <v-app>
        <v-main>
            <v-container class="menu" v-if="!selectedItem">
                <v-row align="center" justify="center">
                    <v-col>
                        <div class="menu-buttons">
                            <h1>500</h1>
                            <join-game></join-game>
                            <v-btn color="secondary" v-for="[label, item] of Object.entries(menuItems)" :key="label" @click="selectedItem = item">{{ label }}</v-btn>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
            <v-container v-else>
                <v-btn color="secondary" @click="selectedItem = null">&lt;</v-btn>
                <component :is="selectedItem"/>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import CreateGame from '../components/menu/CreateGame.vue';
import JoinGame from '../components/menu/JoinGame.vue';
import Doodle from '../components/menu/Doodle.vue';

export default {
    components: {
        CreateGame,
        JoinGame,
        Doodle
    },
    data() {
        this.menuItems = {
            'Create': 'CreateGame',
            'Sandbox': 'Doodle',
        };
        return {
            selectedItem: null,
        };
    },
};
</script>

<style lang="scss">
@use "css/base";
.menu {
    height: 100%;
    display: flex;
}

.menu-buttons {
    & > h1 {
        text-align: center;
    }

    & > * {
        display: block;
        margin: 10px auto;
        min-width: 200px;
        max-width: 300px;
        width: 50%;
    }
}
</style>
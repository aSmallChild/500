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
import Client from './server/Client.js';
import CreateGame from '../components/menu/CreateGame.vue';
import JoinGame from '../components/menu/JoinGame.vue';
import Doodle from '../doodle/Doodle.vue';

const client = new Client(window.socketURL);
export default {
    components: {
        CreateGame,
        JoinGame,
        Doodle
    },
    data() {
        this.client = client;
        return {
            selectedItem: null,
            menuItems: {
                'Create': 'CreateGame',
                'Sandbox': 'Doodle',
            }
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
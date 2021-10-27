<template>
    <div class="container">
        <h1>Game: {{ name.toUpperCase() }}</h1>
        <game-config :players="players" :current-player="currentPlayer"/>
        <h2>Players {{ players.length }}</h2>
        <div v-for="player in players" :key="player.name">
            {{ player.name }}{{ player.isAdmin ? ' (admin)' : '' }}
            <v-btn v-if="currentPlayer.isAdmin && !player.isAdmin" @click="lobby.giveAdmin(player)" size="small" color="primary">Admin</v-btn>
            <v-btn v-if="currentPlayer.isAdmin && !player.isAdmin" @click="kickPlayer(player)" size="small" color="secondary">Kick</v-btn>
        </div>
    </div>
</template>

<script>
import {computed, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import ClientChannel from '../../src/client/ClientChannel.js';
import GameConfig from '../components/GameConfig.vue';

// connects to the server, and displays the current stage of the game
export default {
    components: {
        GameConfig,
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const name = ref(route.params.id);
        const players = ref([]);
        const gameConfig = ref({}); //todo
        const clientId = ref(null);
        const currentPlayer = computed(() => players.value.find(player => player.clientId === clientId.value));
        let channel = null;

        const channelName = route.params.id;
        const channelKey = `game:${channelName}`;

        const sendPlayerAction = (actionName, actionData) => channel.emit('player:action', {actionName, actionData});

        const redirectBack = () => router.push('/join' + (channelName ? '/' + channelName : ''));
        const kickPlayer = player => channel.emit('game:kick', player.id); // todo

        const lobby = {
            giveAdmin(player) {
                sendPlayerAction('give_admin', player.id); //todo make this game:admin, remove from lobby stage
            },
            ready(isReady) {//todo
                sendPlayerAction(isReady ? 'ready' : 'not_ready', isReady);
            },
            requestPartner(player) { //todo
                sendPlayerAction('partner', player.id);
            },
            startGame() {//todo
                sendPlayerAction('start_game');
            },
            gameConfig() {// todo
                sendPlayerAction('game_config', gameConfig.value);
            }
        };

        (async () => {
            try {
                let response;
                [channel, response] = await ClientChannel.reconnect(channelKey);
                if (!response.success) {
                    console.error(response);
                    redirectBack();
                    return;
                }
                clientId.value = channel.clientId;
                name.value = channel.name;
                channel.on('game:stage', stage => {
                    console.log(`current stage: ${stage}`);
                });
                channel.on('game:players', newList => {
                    players.value = newList;
                });

                channel.join();
            } catch (err) {
                console.error(err);
                redirectBack();
            }
        })();

        return {name, players, clientId, currentPlayer, kickPlayer, lobby};
    },
};
</script>

<style lang="scss" scoped>
.container {
    margin: 10px auto;
    min-width: 200px;
    max-width: 300px;
}
</style>
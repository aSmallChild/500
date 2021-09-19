<template>
    <div>
        <h1>Game: {{ name }}</h1>
        <game-config :players="players" :clientId="clientId"/>
        <div>
            <h2>Players {{ players.length }}</h2>
            <div v-for="player in players" :key="player.name">{{ player.name }}, {{ player.clientId + (player.isAdmin ? '(admin)' : '') }}</div>
        </div>
    </div>
</template>

<script>
import {ref} from 'vue';
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
        const clientId = ref(null);

        const channelName = route.params.id;
        const channelKey = `game:${channelName}`;

        const redirectBack = () => router.push('/');

        (async () => {
            try {
                const [channel, response] = await ClientChannel.reconnect(channelKey);
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

        return {name, players, clientId};
    },
};
</script>

<style scoped>

</style>
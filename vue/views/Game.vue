<template>
    <div class="container">
        <h1>{{ currentStage || 'Game' }} {{ name.toUpperCase() }}</h1>
        <component :is="currentStage" :players="players" :current-player="currentPlayer"
                   @player-action="playerAction" @game-action="gameAction"/>
    </div>
</template>

<script>
import {computed, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import ClientChannel from '../../src/client/ClientChannel.js';
import Lobby from '../components/GameStage/Lobby.vue';

const stages = {
    Lobby
};

export default {
    components: {
        ...stages
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const currentStage = ref(null);
        const name = ref(route.params.id);
        const players = ref([]);
        const clientId = ref(null);
        const currentPlayer = computed(() => players.value.find(player => player.clientId === clientId.value));
        let channel = null;

        const channelName = route.params.id;
        const channelKey = `game:${channelName}`;

        const redirectBack = () => router.push('/join' + (channelName ? '/' + channelName : ''));
        const gameAction = data => channel.emit('game:action', data);
        const playerAction = data => channel.emit('player:action', data);

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
                    currentStage.value = stage;
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

        return {name, players, clientId, currentPlayer, currentStage, playerAction, gameAction};
    },
};
</script>

<style lang="scss" scoped>
h1 {
    text-transform: capitalize;
}
.container {
    margin: 10px auto;
    min-width: 200px;
    max-width: 300px;
}
</style>
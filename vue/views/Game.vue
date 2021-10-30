<template>
    <div class="container">
        <h1>{{ currentStage || 'Game' }} {{ name.toUpperCase() }}</h1>
    </div>
    <component :is="currentStage" :players="players" :current-player="currentPlayer"
         @stage-action="stageAction"
         @stage-action-handler="onStageActionHandler"
         @game-action="gameAction"
         @game-action-handler="onGameActionHandler"
    />
</template>

<script>
import {computed, onUnmounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import ClientChannel from '../../src/client/ClientChannel.js';
import Lobby from '../components/GameStage/Lobby.vue';
import Bidding from '../components/GameStage/Bidding.vue';

const stages = {
    Lobby,
    Bidding
};

export default {
    components: {
        ...stages,
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const currentStage = ref(null);
        const name = ref(route.params.id);
        const players = ref([]);
        const clientId = ref(null);
        const currentPlayer = computed(() => players.value.find(player => player.clientId === clientId.value));
        let channel = null, stageActionHandler, gameActionHandler;
        watch(() => currentStage, (current, previous) => {
            if (current === previous) {
                return;
            }
            stageActionHandler = null;
            gameActionHandler = null;
        });

        const channelName = route.params.id;
        const channelKey = `game:${channelName}`;

        const redirectBack = target => router.push(target || '/join' + (channelName ? '/' + channelName : ''));
        const gameAction = data => channel.emit('game:action', data);
        const stageAction = data => channel.emit('stage:action', data);
        const onStageActionHandler = handler => {
            stageActionHandler = handler;
            channel.emit('stage:mounted');
        };
        const onGameActionHandler = handler => gameActionHandler = handler;

        (async () => {
            try {
                let response;
                [channel, response] = await ClientChannel.reconnect(channelKey);
                if (!response.success) {
                    console.error(response);
                    redirectBack(response.code === 'invalid_channel' ? '/new' : '');
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
                channel.on('game:action', data => {
                    if (gameActionHandler) gameActionHandler(data);
                    else console.log('NO HANDLER FOR GAME ACTION');
                });
                channel.on('stage:action', data => {
                    if (stageActionHandler) stageActionHandler(data);
                    else console.log('NO HANDLER FOR STAGE ACTION');
                });

                channel.join();
            } catch (err) {
                console.error(err);
                redirectBack();
            }
        })();

        onUnmounted(() => {
            if (channel) channel.leave();
        })
        return {name, players, clientId, currentPlayer, currentStage, stageAction, gameAction, onStageActionHandler, onGameActionHandler};
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
<template>
    <h1 @click="copyGameLink">
        {{ showLinkCopiedMessage ? 'Copied' : currentStage || 'Game' }} {{ name.toUpperCase() }}
    </h1>
    <h2 v-if="currentPlayer">{{ !connected ? '⛔ ' : '' }}{{ currentPlayer.name }}</h2>
    <div>
        <component :is="currentStage" ref="stage" @stage-action="stageAction" @game-action="gameAction"/>
    </div>
</template>

<script>
import {nextTick, onUnmounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {addSocketListener, createSession, disconnectSession, removeSocketListener, sendMessage} from '../../../lib/client/createSession.js';
import Lobby from '../components/GameStage/Lobby.vue';
import Bidding from '../components/GameStage/Bidding.vue';
import Kitty from '../components/GameStage/Kitty.vue';
import {usePlayers} from '../components/GameStage/common.js';

const stages = {
    Lobby,
    Bidding,
    Kitty,
};

export default {
    components: {
        ...stages,
    },
    setup() {
        const {players, currentPlayer, userId} = usePlayers();
        const router = useRouter();
        const route = useRoute();
        const currentStage = ref(null);
        const name = ref(route.params.id || '');
        const connected = ref(false);
        const stage = ref(null);
        const showLinkCopiedMessage = ref(false);
        let listener = null;

        const gameCode = route.params.id;

        const redirectBack = target => router.push(target || {name: 'game_join', params: {id: gameCode}});
        const gameAction = data => sendMessage('game:action', data);
        const stageAction = data => sendMessage('stage:action', data);
        const copyGameLink = () => {
            navigator.clipboard.writeText(window.location);
            showLinkCopiedMessage.value = true;
            setTimeout(() => showLinkCopiedMessage.value = false, 1337);
        };

        (async () => {
            try {
                const credentials = JSON.parse(window.localStorage.getItem('last_game_credentials'));
                if (credentials.gameCode != gameCode) {
                    router.push({name: 'game_join', params: {id: gameCode}});
                    return;
                }

                listener = (event, data) => {
                    switch (event) {
                        case 'open':
                            return connected.value = true;
                        case 'close':
                            return connected.value = false;
                        case 'game:stage': {
                            if (currentStage.value == data) return;
                            currentStage.value = data;
                            nextTick(() => sendMessage('stage:mounted', currentStage.value));
                            return;
                        }
                        case 'game:players':
                            return players.value = data;
                        case 'game:action': {
                            const {actionName, actionData} = data;
                            stage.value?.gameAction(actionName, actionData);
                            return;
                        }
                        case 'stage:action': {
                            const {actionName, actionData} = data;
                            stage.value?.stageAction(actionName, actionData);
                            return;
                        }
                    }
                };
                addSocketListener(listener);
                if (!await createSession(import.meta.env.VITE_API_URL, gameCode, credentials.userId, true)) {
                    console.error('FAILED TO CREATE SESSION');
                    redirectBack('/');
                    return;
                }
                userId.value = credentials.userId;
                name.value = gameCode;

            } catch (err) {
                console.error(err);
                redirectBack();
            }
        })();
        onUnmounted(() => {
            if (listener) removeSocketListener(listener);
            disconnectSession();
        });
        return {name, players, userId, currentPlayer, currentStage, stageAction, gameAction, copyGameLink, showLinkCopiedMessage, stage, connected};
    },
};
</script>

<style lang="scss" scoped>
h1, h2 {
    text-transform: capitalize;
    margin: 10px;
    cursor: pointer;
    text-align: center;
}
</style>
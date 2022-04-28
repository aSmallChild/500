<template>
    <h1 @click="copyGameLink">
        {{ showLinkCopiedMessage ? 'Copied' : currentStage || 'Game' }} {{ name.toUpperCase() }}
    </h1>
    <h2 v-if="currentPlayer">{{ currentPlayer.name }}</h2>
    <div>
        <component :is="currentStage"
                   @stage-action="stageAction"
                   @stage-action-handler="onStageActionHandler"
                   @game-action="gameAction"
                   @game-action-handler="onGameActionHandler"
        />
    </div>
</template>

<script>
import {onUnmounted, ref, watch} from 'vue';
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
        const showLinkCopiedMessage = ref(false);
        let listener = null, stageActionHandler, gameActionHandler;
        watch(() => currentStage, (current, previous) => {
            if (current === previous) {
                return;
            }
            stageActionHandler = null;
            gameActionHandler = null;
        });

        const gameCode = route.params.id;

        const redirectBack = target => router.push(target || '/join' + (gameCode ? '/' + gameCode : ''));
        const gameAction = data => sendMessage('game:action', data);
        const stageAction = data => sendMessage('stage:action', data);
        const onStageActionHandler = handler => {
            stageActionHandler = handler;
            sendMessage('stage:mounted');
        };
        const onGameActionHandler = handler => gameActionHandler = handler;
        const copyGameLink = () => {
            navigator.clipboard.writeText(window.location);
            showLinkCopiedMessage.value = true;
            setTimeout(() => showLinkCopiedMessage.value = false, 1337);
        };

        (async () => {
            try {
                const credentials = JSON.parse(window.localStorage.getItem('last_game_credentials'));
                if (credentials.gameCode != gameCode) {
                    return;
                }
                if (!createSession(import.meta.env.VITE_API_URL, gameCode, credentials.userId)) {
                    console.error('FAILED TO CREATE SESSION');
                    redirectBack('/');
                    return;
                }
                userId.value = credentials.userId;
                name.value = gameCode;

                listener = (event, data) => {
                    if (event == 'game:stage') {
                        currentStage.value = data;
                    }
                    if (event == 'game:players') {
                        players.value = data;
                    }
                    if (event == 'game:action') {
                        if (gameActionHandler) gameActionHandler(data);
                        else console.log('NO HANDLER FOR GAME ACTION');
                    }
                    if (event == 'stage:action') {
                        const {actionName, actionData} = data;
                        if (stageActionHandler) stageActionHandler(actionName, actionData);
                        else console.log('NO HANDLER FOR STAGE ACTION');
                    }
                };
                addSocketListener(listener);
            } catch (err) {
                console.error(err);
                redirectBack();
            }
        })();
        onUnmounted(() => {
            if (listener) removeSocketListener(listener);
            disconnectSession();
        });
        return {name, players, userId, currentPlayer, currentStage, stageAction, gameAction, onStageActionHandler, onGameActionHandler, copyGameLink, showLinkCopiedMessage};
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
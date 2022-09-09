<script>
import {onUnmounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {addSocketListener, createSession, disconnectSession, removeSocketListener, sendMessage} from 'lib/client/createSession.js';
import Lobby from '../components/GameStage/Lobby.vue';
import Bidding from '../components/GameStage/Bidding.vue';
import Kitty from '../components/GameStage/Kitty.vue';
import Round from '../components/GameStage/Round.vue';
import {usePlayers} from '../components/GameStage/common.js';

const stages = {
    Lobby,
    Bidding,
    Kitty,
    Round,
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
        const error = ref('');
        let listener = null;

        const gameCode = route.params.id;

        const redirectJoinGame = () => router.push({name: 'game_join', params: {id: gameCode}});
        const redirectMainMenu = () => router.push('/');
        const gameAction = data => sendMessage('game:action', data);
        const stageAction = data => sendMessage('stage:action', data);
        const copyGameLink = () => {
            navigator.clipboard.writeText(window.location);
            showLinkCopiedMessage.value = true;
            setTimeout(() => showLinkCopiedMessage.value = false, 1337);
        };
        const onStageMounted = () => sendMessage('stage:mounted', currentStage.value);

        (async () => {
            try {
                const credentials = JSON.parse(window.localStorage.getItem('last_game_credentials'));
                if (credentials?.gameCode != gameCode) {
                    return redirectJoinGame();
                }

                listener = (event, data) => {
                    switch (event) {
                        case 'open':
                            return connected.value = true;
                        case 'close':
                            connected.value = false;
                            if (data.code === 4004) {
                                error.value = 'Invalid game code.';
                                setTimeout(redirectMainMenu, 10000);
                            }
                            if (data.code === 4001) {
                                error.value = 'Login failed.';
                                setTimeout(redirectJoinGame, 10000);
                            }
                            return;
                        case 'game:stage': {
                            if (currentStage.value == data) return;
                            currentStage.value = data;
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
                if (!await createSession(import.meta.env.VITE_API_URL, gameCode, credentials?.userId, credentials?.userPassword, true)) {
                    console.error('FAILED TO CREATE SESSION');
                    redirectMainMenu();
                    return;
                }
                userId.value = credentials?.userId;
                name.value = gameCode;

            } catch (err) {
                console.error(err);
                redirectJoinGame();
            }
        })();
        onUnmounted(() => {
            if (listener) removeSocketListener(listener);
            disconnectSession();
        });
        return {name, error, players, userId, currentPlayer, currentStage, stageAction, gameAction, copyGameLink, showLinkCopiedMessage, stage, connected, onStageMounted};
    },
};
</script>

<template>
    <h1 v-if="error" v-text="error" class="error"/>
    <template v-else>
        <h1 v-if="name" @click="copyGameLink" class="heading-game-code">
            {{ showLinkCopiedMessage ? 'Copied' : currentStage || 'Game' }} {{ name.toUpperCase() }}
        </h1>
        <h2 v-if="currentPlayer" class="heading-player">{{ !connected ? '⛔ ' : '' }}{{ currentPlayer.name }}</h2>
        <div>
            <component :is="currentStage" ref="stage" @stage-action="stageAction" @game-action="gameAction"
                       @stage-mounted="onStageMounted"/>
        </div>
    </template>
</template>

<style>
.heading-game-code {
    text-transform: capitalize;
    margin: 10px;
    cursor: pointer;
    text-align: center;
}

.heading-player {
    margin: 10px;
    text-align: center;
}

.error {
    text-align: center;
    color: red;
}
</style>
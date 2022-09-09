<script>
import {ref} from 'vue';
import {NButton, NSpace, NInput, NInputGroup, NText} from 'naive-ui';
import {useRoute, useRouter} from 'vue-router';
import createLobby from 'lib/client/createLobby.js';
import createUser from 'lib/client/createUser.js';

function saveCredentials(response, userPassword) {
    window.localStorage.setItem('last_game_credentials', JSON.stringify({
        userId: response.user.userId,
        username: response.user.username,
        userPassword,
        gameCode: response.lobby.lobbyId,
        // gamePassword: response.lobby.password
    }));
}

function loadCredentials() {
    const json = window.localStorage.getItem('last_game_credentials');
    return json ? JSON.parse(json) : null;
}

export default {
    props: {
        newGame: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        NButton, NSpace, NInput, NInputGroup, NText,
    },
    setup(props) {
        const route = useRoute();
        const router = useRouter();
        const gameCode = ref(route.params.id || '');
        const playerName = ref(loadCredentials()?.username ?? '');
        const error = ref('');
        const isSubmitting = ref(false);
        const createGameInstead = ref(false);
        const isNewGame = ref(props.newGame);

        const switchToCreateGame = () => {
            createGameInstead.value = false;
            isNewGame.value = true;
            submit();
        };
        const submit = async () => {
            if (isSubmitting.value) {
                return;
            }
            isSubmitting.value = true;
            // todo maybe leave the previous game if there is one already
            await (isNewGame.value ? newGame : joinGame)();
            isSubmitting.value = false;
        };

        const redirectToGame = () => router.push({name: 'game', params: {id: gameCode.value}});

        const joinGame = async () => {
            try {
                const userPassword = 'password123'; // todo
                const gamePassword = ''; // todo
                const response = await createUser(import.meta.env.VITE_API_URL, gameCode.value, gamePassword, playerName.value, userPassword);
                if (!response.success) {
                    error.value = `Failed to join game: ${response.message}`;
                    createGameInstead.value = response.code === 'invalid_channel';
                    return;
                }
                saveCredentials(response, userPassword);
                redirectToGame();
            } catch (err) {
                console.error(err);
            }

        };

        const newGame = async () => {
            try {
                const userPassword = 'password123';  // todo
                const gamePassword = '';  // todo
                const response = await createLobby(import.meta.env.VITE_API_URL, '500', gamePassword, playerName.value, userPassword);
                if (!response.success) {
                    error.value = `Failed to create game: ${response.message}`;
                    return;
                }
                gameCode.value = response.lobby.lobbyId;
                saveCredentials(response, userPassword);
                redirectToGame();
            } catch (err) {
                error.value = `Failed to create game.`;
                console.error(err);
            }
        };

        return {gameCode, playerName, error, isSubmitting, submit, createGameInstead, isNewGame, switchToCreateGame};
    },
};
</script>

<template>
    <n-space justify="center" align="center" vertical class="full-height">
        <n-input-group>
            <n-input v-if="!isNewGame" placeholder="Code" :disabled="isNewGame" :input-props="{pattern: '[A-Z]', autocapitalize: 'characters'}" maxlength="6" type="text"
                     v-model:value="gameCode" @keyup.enter="submit" @input="gameCode = $event.toUpperCase()"/>
            <n-input placeholder="Name" v-model:value="playerName" type="text" @keyup.enter="submit" required/>
            <n-button @click="submit" :disabled="isSubmitting || isNewGame && !playerName">{{ isNewGame || playerName ? 'Play' : 'Watch' }}</n-button>
        </n-input-group>
        <n-text type="error" v-if="error">{{ error }}</n-text>
        <n-button v-if="createGameInstead" @click="switchToCreateGame" :disabled="isSubmitting">Create new game instead</n-button>
    </n-space>
</template>
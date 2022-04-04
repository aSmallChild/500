<template>
    <n-space justify="center" align="center" vertical class="full-height">
        <n-input-group>
            <n-input v-if="!isNewGame" placeholder="Code" :disabled="isNewGame" v-model:value="gameCode" pattern="A-Z" maxlength="6" type="text" @keyup.enter="submit"/>
            <n-input placeholder="Name" v-model:value="playerName" type="text" @keyup.enter="submit" required/>
            <n-button @click="submit" :disabled="isSubmitting || isNewGame && !playerName">{{ isNewGame || playerName ? 'Play' : 'Watch' }}</n-button>
        </n-input-group>
        <n-text type="error" v-if="error">{{ error }}</n-text>
        <n-button v-if="createGameInstead" @click="switchToCreateGame" :disabled="isSubmitting">Create new game instead</n-button>
    </n-space>
</template>

<script>
import {ref} from 'vue';
import {NButton, NSpace, NInput, NInputGroup, NText} from 'naive-ui';
import {useRoute, useRouter} from 'vue-router';
import ClientChannel from '../../../lib/client/ClientChannel.js';

export default {
    props: {
        newGame: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        NButton, NSpace, NInput, NInputGroup, NText
    },
    setup(props) {
        const route = useRoute();
        const router = useRouter();
        const gameCode = ref(route.params.id || '');
        const playerName = ref('');
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

        const redirectToGame = () => router.push(`/game/${gameCode.value}`);

        const joinGame = async () => {
            try {
                const playerPassword = ''; // todo
                const gamePassword = ''; // todo
                const [, response] = await ClientChannel.connect(`game:${gameCode.value}`, gameCode.value, gamePassword, playerName.value, playerPassword);
                if (!response.success) {
                    error.value = `Failed to join game: ${response.message}`;
                    createGameInstead.value = response.code === 'invalid_channel';
                    return;
                }
                redirectToGame();
            } catch (err) {
                console.error(err);
            }

        };

        const newGame = async () => {
            try {
                const playerPassword = '';  // todo
                const gamePassword = '';  // todo
                const [channel, response] = await ClientChannel.create('game', gamePassword, playerName.value, playerPassword);
                if (!response.success) {
                    error.value = `Failed to create game: ${response.message}`;
                    return;
                }
                gameCode.value = channel.name;
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
<template>
    <div class="menu">
        <!-- waiting for vuetify to be finished so v-text-field is available -->
        <div class="menu-buttons">
            <label class="wrapper" v-if="!isNewGame">
                <span>Game</span>
                <input :disabled="isNewGame" v-model="gameCode" pattern="A-Z" maxlength="6" type="text" @keyup.enter="submit">
            </label>
            <label class="wrapper">
                <span>Name</span>
                <input v-model="playerName" type="text" @keyup.enter="submit">
            </label>
            <n-button type="primary" @click="submit" :disabled="isSubmitting">{{ playerName ? 'Play' : 'Watch' }}</n-button>
            <div class="error" v-if="error">
                {{ error }}
            </div>
            <n-button type="secondary" v-if="createGameInstead" @click="switchToCreateGame" :disabled="isSubmitting">create new game instead</n-button>
        </div>
    </div>
</template>

<script>
import {ref} from 'vue';
import {NButton} from 'naive-ui';
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
        NButton,
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
                console.error(err);
            }
        };

        return {gameCode, playerName, error, isSubmitting, submit, createGameInstead, isNewGame, switchToCreateGame};
    },
};
</script>

<style lang="scss" scoped>
label {
    display: block;
}

.wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 400px;
    font-size: 24px;
}

span, input {
    min-width: 100px;
    padding: 0 0.5rem;
}

span {
    text-align: center;
}

input {
    background: grey;
    flex: 1;
}

.menu {
    height: 100%;
    display: flex;
}

.menu-buttons {
    & > h1 {
        text-align: center;
    }

    & > * {
        margin: 10px auto;
        min-width: 200px;
        max-width: 300px;
        width: 50%;
    }

    & > .v-btn {
        display: block;
    }
}
</style>
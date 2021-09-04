<template>
    <v-container class="menu">
        <v-row align="center" justify="center">
            <v-col>
                <div class="menu-buttons">
                    <!-- waiting for vuetify to be finished so v-text-field is available -->
                    <label class="wrapper" v-if="!newGame">
                        <span>Game</span>
                        <input :disabled="newGame" v-model="gameCode" pattern="A-Z" maxlength="6" type="text">
                    </label>
                    <label class="wrapper">
                        <span>Name</span>
                        <input v-model="playerName" type="text">
                    </label>
                    <v-btn color="secondary" @click="submit" :disabled="isSubmitting">{{ playerName ? 'Play' : 'Watch' }}</v-btn>
                    <div class="error">
                        {{ error }}
                    </div>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import Client from '../../src/client/Client.js';
import {ref} from 'vue';
import {useRouter} from 'vue-router';

export default {
    props: {
        newGame: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const router = useRouter();
        const gameCode = ref('');
        const playerName = ref('');
        const error = ref('');
        const isSubmitting = ref(false);
        const client = Client.client;

        const submit = async () => {
            if (isSubmitting.value) {
                return;
            }
            isSubmitting.value = true;
            // todo maybe leave the previous game if there is one already
            await (props.newGame ? newGame : joinGame)();
            isSubmitting.value = false;
        };

        const redirectToGame = () => router.push(`/game/${gameCode.value}`);

        const joinGame = async () => {
            try {
                const playerPassword = '';  // todo
                const channel = client.getChannel(`game:${gameCode.value}`, gameCode.value);
                const response = await channel.login(playerPassword);
                if (!response.success) {
                    error.value = `Failed to join game: ${response.message}`;
                    return;
                }
                redirectToGame();
            } catch (err) {
                console.error(err);
            }

        };

        const newGame = async () => {
            try {
                const gamePassword = '';  // todo
                const [channel, response] = await client.requestNewChannel('game', gamePassword);
                if (!response.success) {
                    error.value = `Failed to join game: ${response.message}`;
                    return;
                }
                gameCode.value = channel.name;
                redirectToGame();
            } catch (err) {
                console.error(err);
            }
        };

        return {gameCode, playerName, error, isSubmitting, submit};
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
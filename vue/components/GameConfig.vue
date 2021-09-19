<template>

    <v-container class="menu">
        <v-row align="center" justify="center">
            <v-col>
                <!-- waiting for vuetify to be finished so v-text-field is available -->
                <form @submit.prevent="submit" class="menu-buttons">
                    <label class="wrapper">
                        <span>Partner</span>
                        <select v-model="requestedPartner">
                            <option :value="null">None</option>
                            <option v-for="player in otherPlayers" :key="player.name">{{ player.name }}</option>
                        </select>
                    </label>
                    <label class="wrapper">
                        <v-text-field color="tertiary" label="Kitty Size" v-model="gameConfig.kittySize" :disabled="!thisPlayer?.isAdmin" type="number"/>
                    </label>
                    <label class="wrapper">
                        <span>Cards Per Hand</span>
                        <input type="number" v-model="gameConfig.cardsPerHand" :disabled="!thisPlayer?.isAdmin">
                    </label>
                    <v-btn color="secondary" @click="submit">Submit?</v-btn>
                </form>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {ref, computed} from 'vue';

export default {
    name: 'GameConfig',
    props: {
        players: Array,
        clientId: String,
    },
    setup(props) {
        const requestedPartner = ref(null);
        const otherPlayers = computed(() => props.players.filter(player => player.clientId !== props.clientId));
        const thisPlayer = computed(() => props.players.find(player => player.clientId === props.clientId));
        const gameConfig = ref({
            cardsPerHand: 10,
            kittySize: 3,
        });
        return {
            gameConfig,
            requestedPartner,
            otherPlayers,
            thisPlayer,
            submit() {

            },
        };
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
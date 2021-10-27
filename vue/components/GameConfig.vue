<template>
    <label>
        <span>Partner</span>
        <select v-model="requestedPartner">
            <option :value="null">None</option>
            <option v-for="player in otherPlayers" :key="player.name">{{ player.name }}</option>
        </select>
    </label>
    <label>
        <span>Kitty Size</span>
        <input type="number" v-model="gameConfig.kittySize" :disabled="!currentPlayer?.isAdmin">
    </label>
    <label>
        <span>Cards Per Hand</span>
        <input type="number" v-model="gameConfig.cardsPerHand" :disabled="!currentPlayer?.isAdmin">
    </label>
</template>

<script>
import {ref, computed} from 'vue';

export default {
    name: 'GameConfig',
    props: {
        players: Array,
        currentPlayer: Object,
    },
    setup(props) {
        const requestedPartner = ref(null);
        const otherPlayers = computed(() => props.players.filter(player => player.clientId !== props.clientId));
        const gameConfig = ref({
            cardsPerHand: 10,
            kittySize: 3,
        });
        return {
            gameConfig,
            requestedPartner,
            otherPlayers,
        };
    },
};
</script>

<style lang="scss" scoped>
label {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 400px;
    font-size: 24px;
    margin: 0.5em 0;
}

input, select {
    min-width: 100px;
    padding: 0 0.75rem;
}

span {
    min-width: 100px;
    margin-right: 1em;
}

select, input {
    background: grey;
    flex: 1;
}
</style>
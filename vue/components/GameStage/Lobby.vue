<template>
    <label>
        <span>Kitty Size</span>
        <input type="number" v-model="gameConfig.kittySize" :disabled="!currentPlayer?.isAdmin" @change="action.updateGameConfig">
    </label>
    <label>
        <span>Cards Per Hand</span>
        <input type="number" v-model="gameConfig.cardsPerHand" :disabled="!currentPlayer?.isAdmin" @change="action.updateGameConfig">
    </label>
    <label v-if="players.length > 3">
        <span>Partner</span>
        <select v-model="requestedPartner" @change="action.requestPartner(requestedPartner)">
            <option :value="null">None</option>
            <option v-for="player in otherPlayers" :key="player.id" :value="player">{{ player.name }}</option>
        </select>
    </label>
    <h2>Players {{ players.length }}</h2>
    <div v-for="player in players" :key="player.name">
        {{ player.name }}{{ player.isAdmin ? ' (admin)' : '' }}
        <v-btn v-if="currentPlayer.isAdmin && !player.isAdmin" @click="game.giveAdmin(player)" size="small" color="primary">Admin</v-btn>
        <v-btn v-if="currentPlayer.isAdmin && !player.isAdmin" @click="game.kickPlayer(player)" size="small" color="secondary">Kick</v-btn>
    </div>
</template>

<script>
import {computed, ref} from 'vue';
import {common, gameActions, stageActions, STAGE_ACTION_EVENT_HANDER} from './common.js';

export default {
    ...common,
    name: 'Lobby',
    setup(props, {emit}) {
        const requestedPartner = ref(null);
        const otherPlayers = computed(() => props.players.filter(player => player.clientId !== props.clientId));
        const gameConfig = ref({
            cardsPerHand: 10,
            kittySize: 3,
        });

        const stageAction = stageActions(emit);
        const action = {
            requestPartner(partner) {
                stageAction('partner', partner.id);
            },
            playerReady(isReady) {
                stageAction('ready', isReady);
            },
            startGame() {
                stageAction('start');
            },
            updateGameConfig() {
                stageAction('config', gameConfig.value);
            },
        };
        const game = gameActions(emit);

        emit(STAGE_ACTION_EVENT_HANDER, ({actionName, actionData}) => {
            if (actionName === 'config') {
                gameConfig.value = actionData;
            }
        });
        return {
            gameConfig,
            requestedPartner,
            otherPlayers,
            game,
            action,
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
<template>
    <n-button v-if="currentPlayer" type="primary" @click="action.playerReady(!isReady)">{{ isReady ? 'Unready' : 'Ready' }}</n-button>
    <n-button v-if="currentPlayer?.isAdmin" secondary @click="action.startGame()" :disabled="players.length < 2">Start</n-button>
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
        <input type="checkbox" :checked="isPlayerReady(player, readyPlayerIds)" disabled/>
        {{ player.name }}
        {{ player.isAdmin ? ' (admin)' : '' }}
        {{ getRequestedPartner(player) ? ` -> ${getRequestedPartner(player).name}` : '' }}
        {{ player.connections ? '' : ' DISCONNECTED' }}
        <n-button v-if="currentPlayer?.isAdmin && !player.isAdmin" @click="game.giveAdmin(player)" size="small" type="primary">Admin</n-button>
        <n-button v-if="currentPlayer?.isAdmin && !player.isAdmin" @click="game.kickPlayer(player)" size="small" secondary>Kick</n-button>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import {usePlayers, stageEvents, gameActions, stageActions} from './common.js';
import {NButton} from 'naive-ui';

const {players, currentPlayer, getPlayerById, otherPlayers} = usePlayers();
const emit = defineEmits(stageEvents);
const requestedPartner = ref(null);
const gameConfig = ref({
    cardsPerHand: 10,
    kittySize: 3,
});
const readyPlayerIds = ref([]);
const isReady = computed(() => isPlayerReady(currentPlayer.value));
const requestedPartners = ref({});
const isPlayerReady = player => player && readyPlayerIds.value.indexOf(player.id) > -1;
const getRequestedPartner = player => {
    if (!player || !(player.id in requestedPartners.value) || !requestedPartners.value[player.id])
        return;
    return getPlayerById(requestedPartners.value[player.id]);
};

const stageAction = stageActions(emit);
const action = {
    requestPartner(partner) {
        stageAction('partner', partner?.id);
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

defineExpose({
    gameAction(actionName, actionData) {

    },
    stageAction(actionName, actionData) {
        switch (actionName) {
            case 'config':
                return gameConfig.value = actionData;
            case 'partners':
                if (currentPlayer.value?.id in actionData) {
                    requestedPartner.value = getPlayerById(actionData[currentPlayer.value.id]);
                }
                return requestedPartners.value = actionData;
            case 'ready_players':
                return readyPlayerIds.value = actionData;
        }
    },
});
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
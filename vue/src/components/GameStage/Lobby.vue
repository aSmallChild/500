<template>
    <n-button v-if="currentPlayer" type="primary" @click="action.playerReady(!isReady)">{{ isReady ? 'Unready' : 'Ready' }}</n-button>
    <n-button v-if="currentPlayer?.isAdmin" type="secondary" @click="action.startGame()" :disabled="players.length < 2">Start</n-button>
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
        <input type="checkbox" :checked="isPlayerReady(player, readyPlayerIds)"/>
        {{ player.name }}
        {{ player.isAdmin ? ' (admin)' : '' }}
        {{ getRequestedPartner(player) ? ` -> ${getRequestedPartner(player).name}` : '' }}
        {{ player.connections ? '' : ' DISCONNECTED' }}
        <n-button v-if="currentPlayer?.isAdmin && !player.isAdmin" @click="game.giveAdmin(player)" size="small" type="primary">Admin</n-button>
        <n-button v-if="currentPlayer?.isAdmin && !player.isAdmin" @click="game.kickPlayer(player)" size="small" type="secondary">Kick</n-button>
    </div>
</template>

<script>
import {computed, ref} from 'vue';
import {common, gameActions, stageActions, STAGE_ACTION_EVENT_HANDER} from './common.js';

import {NButton} from 'naive-ui';

export default {
    ...common,
    components: {
        NButton,
    },
    setup(props, {emit}) {
        const getPlayerById = id => props.players.find(player => player.id === id);
        const requestedPartner = ref(null);
        const otherPlayers = computed(() => props.players.filter(player => player.id !== props.currentPlayer.id));
        const gameConfig = ref({
            cardsPerHand: 10,
            kittySize: 3,
        });
        const readyPlayerIds = ref([]);
        const isReady = computed(() => isPlayerReady(props.currentPlayer));
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

        emit(STAGE_ACTION_EVENT_HANDER, ({actionName, actionData}) => {
            switch (actionName) {
                case 'config':
                    return gameConfig.value = actionData;
                case 'partners':
                    if (props.currentPlayer?.id in actionData) {
                        requestedPartner.value = getPlayerById(actionData[props.currentPlayer.id]);
                    }
                    return requestedPartners.value = actionData;
                case 'ready_players':
                    return readyPlayerIds.value = actionData;
            }
        });
        return {
            gameConfig,
            requestedPartner,
            otherPlayers,
            game,
            action,
            readyPlayerIds,
            isReady,
            isPlayerReady,
            requestedPartners,
            getPlayerById,
            getRequestedPartner,
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
<template>
    <card-svg-defs :def="OrdinaryNormalDeck.svgDefs"/>
    <div>
        <!-- display bid winning bid  -->
        <!-- show hands to players -->
        <!-- show face down hands of other players -->
        <!-- show kitty to winner -->
        <div style="text-align: center">
            <h2 v-if="bid">{{ getPlayerSymbols(bidder) }} {{ bidder.name }} leads with {{ bid.getName() }} ({{ bid.points }})</h2>
            <template v-if="kitty">
                <div>kitty</div>
                <card-group v-if="kitty" :cards="kitty" fan @card="action.moveCard($event, 'kitty')"/>
            </template>
            <div>hand</div>
            <card-group v-if="hand" :cards="hand" fan @card="action.moveCard($event, 'hand')"/>
            <br>
            <div>{{ error }}</div>
            <n-button v-if="isLeadingBidder" @click="action.done()" :type="error ? 'error' : 'primary'">Done</n-button>
        </div>
        <h2>Players ({{ players.length }})</h2>
        <div v-for="player in players" :key="player.name">
            {{ player.position }}.&nbsp;{{ player.name }} {{ getPlayerSymbols(player) }}
        </div>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import {usePlayers, stageEvents, gameActions, stageActions, getCardSvg} from './common.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import ScoringAvondale from '../../../../lib/game/model/ScoringAvondale.js';
import CardGroup from '../CardGroup.vue';
import CardSvgDefs from '../CardSvgDefs.vue';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import Bid from '../../../../lib/game/model/Bid.js';
import {NButton} from 'naive-ui';

const {players, currentPlayer, getPlayerByPosition} = usePlayers();
const emit = defineEmits(stageEvents);
let deckConfig, scoring;
const hand = ref(null);
const kitty = ref(null);
const error = ref(null);
const bidderPosition = ref(null);
const bidder = computed(() => getPlayerByPosition(bidderPosition.value));
const isLeadingBidder = computed(() => currentPlayer.value == bidder.value);
const bid = ref(null);

const stageAction = stageActions(emit);
const action = {
    moveCard(card, from) {
        stageAction('move_card', {card, from});
    },
    done() {
        stageAction('done');
    },
};
const game = gameActions(emit);
const onCards = (target, serializedCards) => {
    try {
        target.value = serializedCards.map(serializedCard => getCardSvg(serializedCard, deckConfig));
    } catch (e) {
        console.error(e);
    }
};

const getPlayerSymbols = player => {
    return player.connections ? '' : '⛔';
};

defineExpose({
    gameAction(actionName, actionData) {

    },
    stageAction(actionName, actionData) {
        switch (actionName) {
            case 'deck_config':
                deckConfig = new DeckConfig(actionData);
                scoring = new ScoringAvondale(deckConfig);
                return;
            case 'hand':
                return onCards(hand, actionData);
            case 'kitty':
                return onCards(kitty, actionData);
            case 'winning_bid':
                const {bid: serializedBid, bidderPosition: position} = actionData;
                bid.value = Bid.fromString(serializedBid, deckConfig);
                bidderPosition.value = position;
                return;
            case 'error':
                return error.value = actionData;
        }
    },
});
</script>
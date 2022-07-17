<script setup>
import {computed, ref, nextTick} from 'vue';
import {usePlayers, stageEvents, gameActions, stageActions, getCardSvg} from './common.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import CardGroup from '../CardGroup.vue';
import CardSvgDefs from '../CardSvgDefs.vue';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import Bid from '../../../../lib/game/model/Bid.js';
import {GameEvents} from 'lib/game/GameEvents.js';

const {players, currentPlayer, getPlayerByPosition} = usePlayers();
const emit = defineEmits(stageEvents);
let deckConfig;
const hand = ref(null);
const error = ref(null);
const handCardGroup = ref();
const tableCardGroup = ref();

const winningBid = ref(null);
const winningBidder = ref(null);
// const isWinningBidder = computed(() => currentPlayer.value == winningBidder.value);

const isMyTurn = computed(() => playerTurn.value == currentPlayer.value);
const playerTurn = ref(null);

const tricks = ref(null);
// const currentTrick = ref(null);
const trickCards = ref([]);

const stageAction = stageActions(emit);
const action = {
  playCard(card, from) {
    stageAction(GameEvents.PLAY_CARD, {card, from});
  },
};
const game = gameActions(emit);
const onCards = (target, serializedCards) => {
  try {
    target.value = serializedCards.map(serializedCard => getCardSvg(serializedCard, deckConfig));
  }
  catch (e) {
    console.error(e);
  }
};

const getPlayerSymbols = player => {
  return player.connections ? '' : '⛔';
};

const deserializeCardsPlayed = playedCards => {
  const cardsPlayed = [];
  for (const [serializedCard, playerPosition] of playedCards) {
    cardsPlayed.push([getCardSvg(serializedCard, deckConfig), getPlayerByPosition(playerPosition)]);
  }
  return cardsPlayed;
};

const deserializeTricks = actionData => {
  const tricks = [];
  for (const {cardsPlayed, winnerPosition, winningCard} of actionData) {
    tricks.push({
      cardsPlayed: deserializeCardsPlayed(cardsPlayed),
      winner: getPlayerByPosition(winnerPosition),
      winningCard: getCardSvg(winningCard, deckConfig),
    });
  }
  return tricks;
};

defineExpose({
  gameAction(actionName, actionData) {

  },
  stageAction(actionName, actionData) {
    switch (actionName) {
      case 'deck_config':
        return deckConfig = new DeckConfig(actionData);
      case 'hand':
        return onCards(hand, actionData);
      case 'winning_bid':
        const {bid: serializedBid, bidderPosition: position} = actionData;
        winningBid.value = Bid.fromString(serializedBid, deckConfig);
        winningBidder.value = getPlayerByPosition(position);
        return;
      case 'past_tricks':
        return tricks.value = deserializeTricks(actionData);
      case 'current_player_position': {
        playerTurn.value = getPlayerByPosition(actionData);
        return;
      }
      case 'current_trick': {
        trickCards.value = deserializeCardsPlayed(actionData).map(([card]) => card);
        nextTick(() => tableCardGroup.value?.clear());
        return;
      }
      case 'error':
        setTimeout(() => error.value = '', 5000);
        return error.value = actionData;
    }
  },
});
</script>

<template>
  <card-svg-defs :def="OrdinaryNormalDeck.svgDefs"/>
  <div>
    <div style="text-align: center">
      <h2 v-if="winningBid">{{ getPlayerSymbols(winningBidder) }} {{ winningBidder.name }} is going for {{ winningBid.getName() }} ({{ winningBid.points }})</h2>
      <h1 v-if="isMyTurn">Your turn!</h1>
      <div>trick</div>
      <card-group v-if="trickCards" :cards="trickCards" pile ref="tableCardGroup"/>
      <div>hand</div>
      <card-group v-if="hand" :cards="hand" fan @card="action.playCard($event, 'hand')" ref="handCardGroup"/>
      <br>
      <div>{{ error }}</div>
    </div>
    <h2>Players ({{ players.length }})</h2>
    <div v-for="player in players" :key="player.name" :class="{'current-player': player === playerTurn}">
      {{ player.position }}.&nbsp;{{ player.name }} {{ getPlayerSymbols(player) }}
    </div>
  </div>
</template>

<style>
.current-player {
  font-weight: bold;
  color: lime;
}
</style>
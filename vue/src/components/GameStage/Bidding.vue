<script setup>
import {computed, ref} from 'vue';
import {gameActions, getCardSvg, stageActions, stageEvents, usePlayers} from './common.js';
import {GameAction} from 'lib/game/GameAction.js';
import DeckConfig from 'lib/game/model/DeckConfig.js';
import BidSelector from '../BidSelector.vue';
import ScoringAvondale from 'lib/game/model/ScoringAvondale.js';
import CardGroup from '../CardGroup.vue';
import CardSvgDefs from '../CardSvgDefs.vue';
import OrdinaryNormalDeck from 'lib/game/model/OrdinaryNormalDeck.js';
import Bid from 'lib/game/model/Bid.js';
import {NButton} from 'naive-ui';
import Scores from '../Scores.vue';

const {players, currentPlayer} = usePlayers();
const emit = defineEmits(stageEvents);
const hasSeenHand = player => playersThatHaveSeenTheirCards.value.has(player.position);
let deckConfig;
const scoring = ref(null);
const hand = ref(null);
const playerBids = ref([]);
const playersThatHaveSeenTheirCards = ref(new Set());
const currentBidderPosition = ref(0);
const leadingBidderPosition = ref(0);
const leadingBidder = computed(() => players.value.find(player => player.position === leadingBidderPosition.value));
const leadingBid = ref(null);
const biddingError = ref('');
const scores = ref(null);

const stageAction = stageActions(emit);
const action = {
  placeBid(bid) {
    stageAction(GameAction.PLACE_BID, bid);
  },
  takeHand() {
    stageAction(GameAction.TAKE_HAND);
  },
  takeKitty() {
    stageAction(GameAction.TAKE_KITTY);
  },
};
const game = gameActions(emit);
const onHand = serializedCards => {
  try {
    hand.value = serializedCards.map(serializedCard => getCardSvg(serializedCard, deckConfig));
  }
  catch (e) {
    console.error(e);
  }
};
const isCurrentBidder = computed(() => currentBidderPosition.value === currentPlayer.value.position);
const hasLeadingBid = computed(() => leadingBidderPosition.value === currentPlayer.value.position);
const canTakeKitty = computed(() => hasLeadingBid.value && isCurrentBidder.value);
const getPlayerSymbols = player => {
  return (player.connections ? '' : '⛔') +
      (player.position === leadingBidderPosition.value ? '🥇' : '') +
      (hasSeenHand(player) ? '' : '😎');
};

defineExpose({
  gameAction(actionName, actionData) {

  },
  stageAction(actionName, actionData) {
    switch (actionName) {
      case 'deck_config':
        deckConfig = new DeckConfig(actionData);
        scoring.value = new ScoringAvondale(deckConfig);
        return;
      case 'bids':
        return playerBids.value = actionData.map(bids => bids.map(bid => Object.freeze(Bid.fromString(bid, deckConfig))));
      case 'current_bidder':
        biddingError.value = '';
        return currentBidderPosition.value = actionData;
      case 'highest_bid': {
        const {position, bid} = actionData;
        leadingBidderPosition.value = position ?? -1;
        leadingBid.value = bid ? Object.freeze(Bid.fromString(bid, deckConfig)) : null;
        return;
      }
      case 'bid_error':
        return biddingError.value = actionData;
      case 'reveal_card':
        return biddingError.value = actionData.message;
      case GameAction.PLACE_BID: {
        const {player, bid} = actionData;
        playerBids.value[player.position].push(Object.freeze(Bid.fromString(bid, deckConfig)));
        return;
      }
      case GameAction.TAKE_HAND:
        return onHand(actionData);
      case GameAction.PLAYERS_TAKEN_HANDS:
        return actionData.forEach(position => playersThatHaveSeenTheirCards.value.add(position));
      case 'kitty_error':
        return console.warn('TODO', actionName); // todo
      case 'player_scores':
        scores.value = actionData;
        return;
    }
  },
});
</script>

<template>
  <card-svg-defs :def="OrdinaryNormalDeck.svgDefs"/>
  <div>
    <bid-selector
        v-if="scoring" :scoring="scoring"
        :leading-bid="leadingBid"
        :has-leading-bid="hasLeadingBid"
        :is-current-bidder="isCurrentBidder"
        :has-seen-hand="!!hand"
        @bid="action.placeBid"
        :error="biddingError"
    />
    <div style="text-align: center">
      <h2 v-if="leadingBid">{{ getPlayerSymbols(leadingBidder) }} {{ leadingBidder.name }}: {{ leadingBid.getName() }} ({{ leadingBid.points }})</h2>
      <card-group v-if="hand" :cards="hand" fan self-clearing/>
      <n-button v-else @click="action.takeHand()" type="primary">Take Hand</n-button>
    </div>
    <div style="text-align: center" v-if="canTakeKitty">
      <n-button @click="action.takeKitty()" type="primary">Take Kitty</n-button>
    </div>
    <h3 data-test="player-heading">Players ({{ players.length }})</h3>
    <div class="bid-player-list">
      <div v-for="player in players" :key="player.name">
        <span :class="{'current-bidder': player.position === currentBidderPosition}">
          {{ player.position }}.&nbsp;{{ player.name }} {{ getPlayerSymbols(player) }}
        </span>
        <div v-for="bid in playerBids[player.position]" :key="bid">- {{ bid.getName() }} ({{ bid.points }})</div>
      </div>
    </div>
  </div>
  <hr>
  <scores v-if="players && scores" :players="players" :scores="scores"/>
</template>

<style lang="scss">
.current-bidder {
  font-weight: bold;
  color: lime;
  text-transform: uppercase;
}

.bid-player-list {
  display: flex;
  flex-direction: row;

  div {
    flex: 1;
    flex-basis: 200px;
    max-width: 400px;

    div {
      margin-left: 1em;
    }
  }
}
</style>
<template>
    <card-svg-defs :def="svgDefs"/>
    <div>
        <bid-selector v-if="scoring" :scoring="scoring" :is-current-bidder="isCurrentBidder" :has-leading-bid="hasLeadingBid" :has-seen-hand="!!hand" @bid="action.placeBid" :error="biddingError"/>
        <div style="text-align: center">
            <card-group v-if="hand" :cards="hand" fan/>
            <v-btn v-else @click="action.takeHand()" color="primary">Take Hand</v-btn>
        </div>
        <h2>Players ({{ players.length }})</h2>
        <div v-for="player in players" :key="player.name" :style="{'font-weight': player.position === currentBidderPosition ? 'strong' : ''}">
            {{ player.position }}.&nbsp;{{ player.name }}
            {{ player.connections ? '' : ' DISCONNECTED' }}
            {{ JSON.stringify(playerBids[player.position]) }}
            {{ player.position === currentBidderPosition ? ' CURRENT' : '' }}
            {{ player.position === highestBidderPosition ? ' WINNING' : '' }}
            {{ hasSeenHand(player) ? ' HAS_SEEN_THEIR_CARDS' : '' }}
        </div>
        <p v-if="highestBid">Highest bid: {{ highestBid }}</p>
        <v-btn v-if="canTakeKitty" @click="action.takeKitty()" color="primary">Take Kitty</v-btn>
    </div>
</template>

<script>
import {computed, ref} from 'vue';
import {common, gameActions, stageActions, STAGE_ACTION_EVENT_HANDER, getCardSvg} from './common.js';
import {GameAction} from '../../../src/game/GameAction.js';
import DeckConfig from '../../../src/game/model/DeckConfig.js';
import BidSelector from '../BidSelector.vue';
import ScoringAvondale from '../../../src/game/model/ScoringAvondale.js';
import CardGroup from '../CardGroup.vue';
import Deck from '../../../src/game/model/Deck.js';
import CardSvgDefs from '../CardSvgDefs.vue';
import OrdinaryNormalDeck from '../../../src/game/model/OrdinaryNormalDeck.js';
import Bid from '../../../src/game/model/Bid.js';

export default {
    ...common,
    components: {
        CardGroup,
        BidSelector,
        CardSvgDefs,
    },
    setup(props, {emit}) {
        const getPlayerById = id => props.players.find(player => player.id === id);
        const getPlayerByPosition = position => props.players[position];
        const hasSeenHand = player => playersThatHaveSeenTheirCards.value.has(player.position);
        let deckConfig;
        const scoring = ref(null);
        const hand = ref(null);
        const playerBids = ref([]);
        const playersThatHaveSeenTheirCards = ref(new Set());
        const currentBidderPosition = ref(0);
        const highestBidderPosition = ref(0);
        const highestBid = ref(null);
        const biddingError = ref('');

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
        const onHand = serializedDeck => {
            try {
                hand.value = Deck.cardsFromString(serializedDeck, deckConfig).map(card => getCardSvg(card, deckConfig));
            } catch (e) {
                console.error(e);
            }
        };
        const isCurrentBidder = () => props.currentPlayer && currentBidderPosition.value === props.currentPlayer.position;
        const hasLeadingBid = () => props.currentPlayer && highestBidderPosition.value === props.currentPlayer.position;
        const canTakeKitty = () => hasLeadingBid() && isCurrentBidder();

        emit(STAGE_ACTION_EVENT_HANDER, ({actionName, actionData}) => {
            switch (actionName) {
                case 'deck_config':
                    deckConfig = new DeckConfig(actionData);
                    scoring.value = new ScoringAvondale(deckConfig);
                    return;
                case 'bids':
                    return playerBids.value = actionData.map(bids => bids.map(bid => Bid.fromString(bid, deckConfig).getName()));
                case 'current_bidder':
                    biddingError.value = '';
                    return currentBidderPosition.value = actionData;
                case 'highest_bid': {
                    const {position, bid} = actionData;
                    highestBidderPosition.value = position ?? -1;
                    highestBid.value = Object.freeze(Bid.fromString(bid, deckConfig));
                    return;
                }
                case 'bid_error':
                    return biddingError.value = actionData;
                case GameAction.PLACE_BID: {
                    const {player, bid} = actionData;
                    playerBids.value[player.position].push(bid);
                    return;
                }
                case GameAction.TAKE_HAND:
                    return onHand(actionData);
                case GameAction.PLAYERS_TAKEN_HANDS:
                    return actionData.forEach(position => playersThatHaveSeenTheirCards.value.add(position));
                case 'kitty_error':
                    return console.log('TODO', actionName); // todo
            }
        });
        return {
            game,
            action,
            getPlayerById,
            getPlayerByPosition,
            playerBids,
            currentBidderPosition,
            highestBidderPosition,
            hasSeenHand,
            scoring,
            hand,
            isCurrentBidder: computed(isCurrentBidder),
            hasLeadingBid: computed(hasLeadingBid),
            canTakeKitty: computed(canTakeKitty),
            svgDefs: OrdinaryNormalDeck.svgDefs,
            biddingError,
            highestBid,
        };
    },
};
</script>

<style scoped>

</style>
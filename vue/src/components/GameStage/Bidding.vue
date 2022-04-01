<template>
    <card-svg-defs :def="svgDefs"/>
    <div>
        <bid-selector v-if="scoring" :scoring="scoring"
                      :leading-bid="leadingBid"
                      :is-current-bidder="isCurrentBidder"
                      :has-leading-bid="hasLeadingBid"
                      :has-seen-hand="!!hand"
                      @bid="action.placeBid"
                      :error="biddingError"/>
        <div style="text-align: center">
            <h2 v-if="leadingBid">{{ getPlayerSymbols(leadingBidder) }} {{ leadingBidder.name }}: {{ leadingBid.getName() }} ({{ leadingBid.points }})</h2>
            <card-group v-if="hand" :cards="hand" fan/>
            <n-button v-else @click="action.takeHand()" type="primary">Take Hand</n-button>
            <n-button v-if="canTakeKitty" @click="action.takeKitty()" type="primary">Take Kitty</n-button>
        </div>
        <h2>Players ({{ players.length }})</h2>
        <div class="bid-player-list">
            <div v-for="player in players" :key="player.name" style="display: inline-block">
                <span :class="{'current-bidder': player.position === currentBidderPosition}">
                    {{ player.position }}.&nbsp;{{ player.name }} {{ getPlayerSymbols(player) }}
                </span>
                <div v-for="bid in playerBids[player.position]" :key="bid">- {{ bid.getName() }} ({{ bid.points }})</div>
            </div>
        </div>
    </div>
</template>

<script>
import {computed, ref} from 'vue';
import {common, gameActions, stageActions, STAGE_ACTION_EVENT_HANDER, getCardSvg} from './common.js';
import {GameAction} from '../../../../lib/game/GameAction.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import BidSelector from '../BidSelector.vue';
import ScoringAvondale from '../../../../lib/game/model/ScoringAvondale.js';
import CardGroup from '../CardGroup.vue';
import Deck from '../../../../lib/game/model/Deck.js';
import CardSvgDefs from '../CardSvgDefs.vue';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import Bid from '../../../../lib/game/model/Bid.js';
import {NButton} from 'naive-ui';

export default {
    ...common,
    components: {
        CardGroup,
        BidSelector,
        CardSvgDefs,
        NButton
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
        const leadingBidderPosition = ref(0);
        const leadingBidder = computed(() => props.players.find(player => player.position === leadingBidderPosition.value));
        const leadingBid = ref(null);
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
        const hasLeadingBid = () => props.currentPlayer && leadingBidderPosition.value === props.currentPlayer.position;
        const canTakeKitty = () => hasLeadingBid() && isCurrentBidder();
        const getPlayerSymbols = player => {
            return (player.connections ? '' : '⛔') +
                (player.position === leadingBidderPosition.value ? '🥇' : '') +
                (hasSeenHand(player) ? '' : '😎');
        };

        emit(STAGE_ACTION_EVENT_HANDER, ({actionName, actionData}) => {
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
                    leadingBid.value = Object.freeze(Bid.fromString(bid, deckConfig));
                    return;
                }
                case 'bid_error':
                    return biddingError.value = actionData;
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
                    return console.log('TODO', actionName); // todo
            }
        });
        return {
            game,
            action,
            getPlayerById,
            getPlayerByPosition,
            getPlayerSymbols,
            playerBids,
            currentBidderPosition,
            leadingBidderPosition,
            leadingBidder,
            leadingBid,
            hasSeenHand,
            scoring,
            hand,
            isCurrentBidder: computed(isCurrentBidder),
            hasLeadingBid: computed(hasLeadingBid),
            canTakeKitty: computed(canTakeKitty),
            svgDefs: OrdinaryNormalDeck.svgDefs,
            biddingError,
        };
    },
};
</script>

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

        div {
            margin-left: 1em;
        }
    }
}
</style>
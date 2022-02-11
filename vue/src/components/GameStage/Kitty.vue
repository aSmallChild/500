<template>
    <card-svg-defs :def="svgDefs"/>
    <div>
        <!-- display bid winning bid  -->
        <!-- show hands to players -->
        <!-- show face down hands of other players -->
        <!-- show kitty to winner -->
        <div style="text-align: center">
            <h2 v-if="leadingBid">{{ getPlayerSymbols(leadingBidder) }} {{ leadingBidder.name }}: {{ leadingBid.getName() }} ({{ leadingBid.points }})</h2>
            <card-group v-if="hand" :cards="hand" fan/>
            <v-btn v-else @click="action.takeHand()" color="primary">Take Hand</v-btn>
            <v-btn v-if="canTakeKitty" @click="action.takeKitty()" color="primary">Take Kitty</v-btn>
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
/* eslint-disable */
import {computed, ref} from 'vue';
import {common, gameActions, stageActions, STAGE_ACTION_EVENT_HANDER, getCardSvg} from './common.js';
import {GameAction} from '../../../../lib/game/GameAction.js';
import DeckConfig from '../../../../lib/game/model/DeckConfig.js';
import ScoringAvondale from '../../../../lib/game/model/ScoringAvondale.js';
import CardGroup from '../CardGroup.vue';
import Deck from '../../../../lib/game/model/Deck.js';
import CardSvgDefs from '../CardSvgDefs.vue';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import Bid from '../../../../lib/game/model/Bid.js';

export default {
    ...common,
    components: {
        CardGroup,
        CardSvgDefs,
    },
    setup(props, {emit}) {
        const getPlayerById = id => props.players.find(player => player.id === id);
        const getPlayerByPosition = position => props.players[position];
        let deckConfig;
        const scoring = ref(null);
        const hand = ref(null);
        const playerBids = ref([]);
        const leadingBidder = computed(() => props.players.find(player => player.position === leadingBidderPosition.value));
        const leadingBid = ref(null);

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

        const getPlayerSymbols = player => {
            return player.connections ? '' : '⛔';
        };

        emit(STAGE_ACTION_EVENT_HANDER, ({actionName, actionData}) => {
            switch (actionName) {
                case 'deck_config':
                    deckConfig = new DeckConfig(actionData);
                    scoring.value = new ScoringAvondale(deckConfig);
                    return;
            }
        });
        return {
            game,
            action,
            getPlayerById,
            getPlayerByPosition,
            getPlayerSymbols,
            playerBids,
            leadingBidder,
            leadingBid,
            scoring,
            hand,
            svgDefs: OrdinaryNormalDeck.svgDefs,
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
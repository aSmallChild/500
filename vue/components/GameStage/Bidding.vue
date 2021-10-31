<template>
    <div>
        <bid-selector v-if="scoring" :scoring="scoring" :has-leading-bid="hasLeadingBid" :has-seen-hand="!!hand" @bid="action.placeBid"/>
        <card-group v-if="hand" :cards="hand" fan/>
        <v-btn v-else @click="action.takeHand()" color="primary">Take Hand</v-btn>
        <h2>Players {{ players.length }}</h2>
        <div v-for="player in players" :key="player.name" :style="{'font-weight': player.position === currentBidder ? 'strong' : ''}">
            {{ player.position }}.&nbsp;{{ player.name }}
            {{ player.connections ? '' : ' DISCONNECTED' }}
            {{ JSON.stringify(playerBids[player.position]) }}
            {{ player.position === currentBidder ? 'CURRENT' : '' }}
        </div>
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

export default {
    ...common,
    components: {
        CardGroup,
        BidSelector,
    },
    setup(props, {emit}) {
        // todo add svg defs to the page
        const getPlayerById = id => props.players.find(player => player.id === id);
        const getPlayerByPosition = position => props.players.find(player => player.position === position);
        let deckConfig;
        const scoring = ref(null);
        const hasLeadingBid = computed(() => false); //todo
        const hand = ref(null);
        const playerBids = ref([]);
        const currentBidder = ref(0);

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

        emit(STAGE_ACTION_EVENT_HANDER, ({actionName, actionData}) => {
            switch (actionName) {
                case 'deck_config':
                    deckConfig = new DeckConfig(actionData);
                    scoring.value = new ScoringAvondale(deckConfig);
                    return;
                case 'possible_bids':
                    return console.log('TODO', actionName);
                case 'bids':
                    return playerBids.value = actionData;
                case 'current_bidder':
                    return currentBidder.value = actionData;
                case 'highest_bid':
                    return console.log('TODO', actionName);
                case 'bid_error':
                    return console.log('TODO', actionName);
                case GameAction.PLACE_BID:
                    return console.log('TODO', actionName);
                case GameAction.TAKE_HAND:
                    return onHand(actionData);
                case 'kitty_error':
                    return console.log('TODO', actionName);
            }
        });
        return {
            game,
            action,
            getPlayerById,
            getPlayerByPosition,
            playerBids,
            currentBidder,
            scoring,
            hand,
            hasLeadingBid,
        };
    },
};
</script>

<style scoped>

</style>
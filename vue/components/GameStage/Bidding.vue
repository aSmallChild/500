<template>
    <div>
        <bid-selector v-if="scoring" :scoring="scoring" :has-leading-bid="hasLeadingBid" :has-seen-hand="!!hand" @bid="action.placeBid(bid)"/>
    </div>
</template>

<script>
import {computed, ref} from 'vue';
import {common, gameActions, stageActions, STAGE_ACTION_EVENT_HANDER} from './common.js';
import {GameAction} from '../../../src/game/GameAction.js';
import DeckConfig from '../../../src/game/model/DeckConfig.js';
import BidSelector from '../BidSelector.vue';
import ScoringAvondale from '../../../src/game/model/ScoringAvondale.js';

export default {
    ...common,
    components: {
        BidSelector
    },
    setup(props, {emit}) {
        console.log('u wot m8')
        const getPlayerById = id => props.players.find(player => player.id === id);
        const otherPlayers = computed(() => props.players.filter(player => player.id !== props.currentPlayer.id));
        const deckConfig = ref(null);
        const scoring = ref(null);
        const hasLeadingBid = computed(() => false); //todo
        const hand = ref(null)

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

        emit(STAGE_ACTION_EVENT_HANDER, ({actionName, actionData}) => {
            switch (actionName) {
                case 'deck_config':
                    deckConfig.value = new DeckConfig(actionData);
                    scoring.value = new ScoringAvondale(deckConfig.value);
                    return;
                case 'possible_bids':
                    return console.log('TODO', actionName);
                case 'bids':
                    return console.log('TODO', actionName);
                case 'current_bidder':
                    return console.log('TODO', actionName);
                case 'highest_bid':
                    return console.log('TODO', actionName);
                case 'bid_error':
                    return console.log('TODO', actionName);
                case GameAction.PLACE_BID:
                    return console.log('TODO', actionName);
                case 'hand':
                    return console.log('TODO', actionName);
                case 'kitty_error':
                    return console.log('TODO', actionName);
            }
        });
        return {
            otherPlayers,
            game,
            action,
            getPlayerById,
            scoring,
            hand,
            hasLeadingBid
        };
    },
};
</script>

<style scoped>

</style>
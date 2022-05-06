<template>
    <div class="bid-selector" v-if="bid">
        <div><b>Tricks</b></div>
        <div>
            <n-button v-for="i in (scoring.maxTricks - scoring.minTricks) + 1" :key="i"
                      @click="setTricks(i - 1 + scoring.minTricks)"
                      :type="bid.tricks == i - 1 + scoring.minTricks ? 'secondary': 'primary'"
                      :disabled="!tricksEnabled(i - 1 + scoring.minTricks, leadingBid)"
                      :data-test-="'bid' + i "
            >{{ i - 1 + scoring.minTricks }}
            </n-button>
        </div>
        <div><b>Trumps</b></div>
        <div>
            <n-button v-for="suit in scoring.config.suits.lowToHigh" :key="suit"
                      @click="setTrumps(suit)"
                      :type="bid.trumps == suit ? 'secondary': 'primary'"
                      :disabled="!suitEnabled(suit, leadingBid)"
            >{{ suit.name }}s
            </n-button>
            <n-button @click="setTrumps(null)"
                      :type="bid.trumps == null ? 'secondary': 'primary'"
                      :disabled="!suitEnabled(null, leadingBid)"
            >No Trumps
            </n-button>
        </div>
        <div><b>AntiTrumps</b></div>
        <div>
            <n-button v-for="suit in scoring.config.suits.lowToHigh" :key="suit"
                      @click="setAntiTrumps(suit)"
                      :type="bid.antiTrumps == suit ? 'secondary': 'primary'"
                      :disabled="canHaveAntiTrump(bid, suit)"
            >{{ suit.name }}s
            </n-button>
            <n-button @click="setAntiTrumps(null)"
                      :type="bid.antiTrumps == null ? 'secondary': 'primary'"
                      :disabled="!!bid.special">None
            </n-button>
        </div>
        <div><b>Special</b></div>
        <div>
            <n-button v-for="specialBid in allowedSpecialBids" :key="specialBid"
                      @click="setSpecialBid(specialBid)"
                      :type="bid.special == specialBid.symbol ? 'secondary': 'primary'"
            >{{ specialBid.name }}
            </n-button>
        </div>
        <div style="text-align: center">
            <h2>{{ bid ? bid.getName() + (bid.points ? ` (${bid.points})` : '') : 'Select Bid' }}</h2>
        </div>
        <div style="text-align: center" v-if="isCurrentBidder">
            <n-button type="primary" @click="placeBid" v-test:place-bid-button>Place Bid</n-button>
            <n-button type="primary" secondary @click="setSpecialBid(scoring.config.getSpecialBid('P')); placeBid()" v-if="!hasLeadingBid">Pass</n-button>
            <div v-test:bid-error>{{ error }}</div>
        </div>
    </div>
</template>

<script>
import Bid from '../../../lib/game/model/Bid.js';
import {NButton} from 'naive-ui';
import {computed, ref} from 'vue';

export default {
    props: {
        hasSeenHand: {
            required: true,
            type: Boolean,
        },
        hasLeadingBid: {
            required: true,
            type: Boolean,
        },
        isCurrentBidder: {
            required: true,
            type: Boolean,
        },
        scoring: {
            required: true,
        },
        leadingBid: {
            type: Bid,
        },
        error: {
            type: String,
        },
    },
    emits: [
        'bid',
    ],
    components: {
        NButton,
    },
    setup(props, {emit}) {
        const bid = ref({});
        const specialBids = [];
        for (const bid of props.scoring.config.specialBids) {
            if (bid.symbol !== 'P') {
                specialBids.push(bid);
            }
        }

        const allowedSpecialBids = computed(() => specialBids.filter(
            bid => {
                if (!bid.points) return false;

                if (props.leadingBid && bid.points <= props.leadingBid.points) return false;

                return !(props.hasSeenHand && bid.special == 'B');
            },
        ));

        const suitEnabled = (suit, leadingBid) => !leadingBid || leadingBid.points < props.scoring.calculateStandardBidPoints(props.scoring.maxTricks, suit, null);
        const tricksEnabled = (tricks, leadingBid) => !leadingBid || leadingBid.points < props.scoring.calculateStandardBidPoints(tricks, null, null);
        const updateStandardBidPoints = () => {
            bid.value.points = props.scoring.calculateStandardBidPoints(bid.value.tricks, bid.value.trumps, bid.value.antiTrumps);
        };
        bid.value = new Bid(props.scoring.minTricks, props.scoring.config.suits.lowToHigh[0], null, null, 0, props.scoring.config);
        updateStandardBidPoints();

        const setSpecialBid = (specialBid) => {
            bid.value.special = specialBid.symbol;
            bid.value.trumps = null;
            bid.value.antiTrumps = null;
            bid.value.points = parseInt(specialBid.points);
            bid.value.tricks = 0;
        };
        const setTricks = (tricks) => {
            bid.value.tricks = tricks;
            bid.value.special = null;
            updateStandardBidPoints();
        };
        const setTrumps = (suit) => {
            if (!bid.value.tricks) {
                bid.value.tricks = props.scoring.minTricks;
            }
            bid.value.trumps = suit;
            if (bid.value.trumps === bid.value.antiTrumps) {
                bid.value.antiTrumps = null;
            }
            bid.value.special = null;
            updateStandardBidPoints();
        };
        const setAntiTrumps = (suit) => {
            if (!bid.value.tricks) {
                bid.value.tricks = props.scoring.minTricks;
            }
            bid.value.antiTrumps = suit;
            bid.value.special = null;
            updateStandardBidPoints();
        };
        const placeBid = () => {
            emit('bid', bid.value);
        };
        const canHaveAntiTrump = (bid, antiTrumpSuit) => {
            return !!bid.special || bid.trumps && bid.trumps.symbol === antiTrumpSuit.symbol;
        };
        return {
            setTricks,
            setSpecialBid,
            setTrumps,
            setAntiTrumps,
            placeBid,
            canHaveAntiTrump,
            suitEnabled,
            tricksEnabled,
            bid,
            allowedSpecialBids,
        };
    },
};
</script>

<style>
.bid-selector button {
    margin: 0 0.25em 0.25em;
}
</style>
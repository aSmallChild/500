<template>
    <v-container grid-list-md fluid>
        <v-row>
            <v-col cols="12">
                <h2 style="display: inline">{{ bid ? bid.getName() + (bid.points ? ` (${bid.points} points)` : '') : 'Select Bid' }}</h2>
            </v-col>
        </v-row>
        <v-row v-if="bid">
            <v-col cols="12" md="2"><b>Tricks</b></v-col>
            <v-col cols="12" md="10">
                <v-btn color="primary" v-for="i in (scoring.maxTricks - scoring.minTricks) + 1" :key="i" @click="setTricks(i - 1 + scoring.minTricks)">{{ i - 1 + scoring.minTricks }}</v-btn>
            </v-col>
            <v-col cols="12" md="2"><b>Trumps</b></v-col>
            <v-col cols="12" md="10">
                <v-btn color="primary" v-for="suit in scoring.config.suits.lowToHigh" :key="suit" @click="setTrumps(suit)">{{ suit.name }}s</v-btn>
                <v-btn color="primary" @click="setTrumps(null)">No Trumps</v-btn>
            </v-col>
            <v-col cols="12" md="2"><b>AntiTrumps</b></v-col>
            <v-col cols="12" md="10">
                <v-btn color="primary" v-for="suit in scoring.config.suits.lowToHigh" :key="suit" :disabled="canHaveAntiTrump(bid, suit)" @click="setAntiTrumps(suit)">{{ suit.name }}s</v-btn>
                <v-btn color="primary" @click="setAntiTrumps(null)" :disabled="!!bid.special">None</v-btn>
            </v-col>
            <v-col cols="12" md="2"><b>Special</b></v-col>
            <v-col cols="12" md="10">
                <v-btn color="primary" v-for="bid in specialBidList" :key="bid" @click="setSpecialBid(bid)">{{ bid.name }}</v-btn>
            </v-col>
            <v-col cols="12" style="text-align: center">
                <v-btn color="primary" @click="placeBid">Place Bid</v-btn>
                <v-btn color="secondary" @click="setSpecialBid(scoring.config.getSpecialBid('P')); placeBid()">Pass</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import Bid from '../../src/game/model/Bid.js';
import {ref} from 'vue';

// todo disable trick numbers if n * no trumps is < highest bid
// todo disable special bids if bid.points < highest bid
// todo disable suits if maxTricks * suit < highest bid
export default {
    props: {
        hasSeenHand: { // todo don't allow blind misere if they have seen their hand
            required: true,
            type: Boolean,
        },
        hasLeadingBid: { // todo don't allow passing if they have the leading bid
            required: true,
            type: Boolean,
        },
        scoring: {
            required: true,
        },
        highestBid: {
            type: Bid,
        },
    },
    emits: [
        'bid',
    ],
    setup(props, {emit}) {
        const bid = ref({});
        const specialBidList = ref([]);

        const updateStandardBidPoints = () => {
            bid.value.points = props.scoring.calculateStandardBidPoints(bid.value.tricks, bid.value.trumps, bid.value.antiTrumps);
        };
        for (const bid of props.scoring.config.specialBids) {
            if (bid.symbol !== 'P') {
                specialBidList.value.push(bid);
            }
        }
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
        // const antiTrumpAllowed = (suit) => {
        //     if (bid.value.special || !suit) {
        //         return false;
        //     }
        //     if (bid.value.trumps) {
        //         return bid.value.trumps.symbol !== suit.symbol;
        //     }
        //     return true;
        // };
        return {
            setTricks,
            setSpecialBid,
            setTrumps,
            setAntiTrumps,
            placeBid,
            canHaveAntiTrump,
            bid,
            specialBidList,
        };
    },
};
</script>

<style scoped>
button {
    margin: 0 0.25em 0.25em;
}
</style>
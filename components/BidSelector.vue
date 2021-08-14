<template>
    <v-container grid-list-md fluid>
        <v-row>
            <v-col cols="12">
                <h2 style="display: inline">{{ modelValue ? modelValue.getName() + (modelValue.points ? ` (${modelValue.points} points)` : '') : 'Select Bid' }}</h2>
            </v-col>
        </v-row>
        <v-row v-if="modelValue">
            <v-col cols="12" md="2"><b>Tricks</b></v-col>
            <v-col cols="12" md="10">
                <v-btn color="secondary" v-for="i in (scoring.maxTricks - scoring.minTricks) + 1" :key="i" @click="setTricks(i - 1 + scoring.minTricks)">{{ i - 1 + scoring.minTricks }}</v-btn>
            </v-col>
            <v-col cols="12" md="2"><b>Trumps</b></v-col>
            <v-col cols="12" md="10">
                <v-btn color="secondary" v-for="suit in config.suits.lowToHigh" :key="suit" @click="setTrumps(suit)">{{ suit.name }}s</v-btn>
                <v-btn color="secondary" @click="setTrumps(null)">No Trumps</v-btn>
            </v-col>
            <v-col cols="12" md="2"><b>AntiTrumps</b></v-col>
            <v-col cols="12" md="10">
                <v-btn color="secondary" v-for="suit in config.suits.lowToHigh" :key="suit" :disabled="canHaveAntiTrump(modelValue, suit)" @click="setAntiTrumps(suit)">{{ suit.name }}s</v-btn>
                <v-btn color="secondary" @click="setAntiTrumps(null)" :disabled="!!modelValue.special">None</v-btn>
            </v-col>
            <v-col cols="12" md="2"><b>Special</b></v-col>
            <v-col cols="12" md="10">
                <v-btn color="secondary" v-for="bid in specialBidList" :key="bid" @click="setSpecialBid(bid)">{{ bid.name }}</v-btn>
            </v-col>
            <v-col cols="12" style="text-align: center">
                <v-btn color="primary" @click="_bid">Place Bid</v-btn>
                <v-btn color="secondary" @click="setSpecialBid(config.getSpecialBid('P')); _bid()">Pass</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import Bid from '../src/game/model/Bid.js';

// todo disable trick numbers if n * no trumps is < highest bid
// todo disable special bids if bid.points < highest bid
// todo disable suits if maxTricks * suit < highest bid
export default {
    props: {
        hasSeenHand: { // todo don't allow blind misere if they have seen their hand
            required: true,
            type: Boolean
        },
        hasLeadingBid: { // todo don't allow passing if they have the leading bid
            required: true,
            type: Boolean
        },
        scoring: {
            required: true,
        },
        highestBid: {
            type: Bid
        },
    },
    data() {
        this.config = null;

        return {
            modelValue: null,
            specialBidList: []
        };
    },
    methods: {
        setSpecialBid(specialBid) {
            this.modelValue.special = specialBid.symbol;
            this.modelValue.trumps = null;
            this.modelValue.antiTrumps = null;
            this.modelValue.points = parseInt(specialBid.points)
            this.modelValue.tricks = 0;
        },
        setTricks(tricks) {
            this.modelValue.tricks = tricks;
            this.modelValue.special = null;
            this.updateStandardBidPoints();
        },
        setTrumps(suit) {
            if (!this.modelValue.tricks) {
                this.modelValue.tricks = this.scoring.minTricks;
            }
            this.modelValue.trumps = suit;
            if (this.modelValue.trumps === this.modelValue.antiTrumps) {
                this.modelValue.antiTrumps = null;
            }
            this.modelValue.special = null;
            this.updateStandardBidPoints();
        },
        setAntiTrumps(suit) {
            if (!this.modelValue.tricks) {
                this.modelValue.tricks = this.scoring.minTricks;
            }
            this.modelValue.antiTrumps = suit;
            this.modelValue.special = null;
            this.updateStandardBidPoints();
        },
        updateStandardBidPoints() {
            this.modelValue.points = this.scoring.calculateStandardBidPoints(this.modelValue.tricks, this.modelValue.trumps, this.modelValue.antiTrumps);
        },
        _bid() {
            this.$emit('bid', this.modelValue);
        },
        canHaveAntiTrump(modelValue, antiTrumpSuit) {
            return !!modelValue.special || modelValue.trumps && modelValue.trumps.symbol === antiTrumpSuit.symbol;
        },
        antiTrumpAllowed(suit) {
            if (this.modelValue.special || !suit) {
                return false;
            }
            if (this.modelValue.trumps) {
                return this.modelValue.trumps.symbol !== suit.symbol;
            }
            return true;
        }
    },
    mounted() {
        this.config = this.scoring.config;
        for (const bid of this.config.specialBids) {
            if (bid.symbol !== 'P') {
                this.specialBidList.push(bid);
            }
        }
        this.modelValue = new Bid(this.scoring.minTricks, this.config.suits.lowToHigh[0], null, null, 0, this.config);
        this.updateStandardBidPoints();
    },
};
</script>

<style scoped>
    button {
        margin: 0 0.25em 0.25em;
    }
</style>
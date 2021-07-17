<template>
    <!--        <div v-for="bid in bids" :key="bid" @click="modelValue = bid">-->
    <!--            {{ bid.getName() }}-->
    <!--        </div>-->
    <v-container grid-list-md text-xs-center fluid>
        <v-row>
            <v-col cols="12"><h1>{{ modelValue ? modelValue.getName() + (modelValue.points ? ` (${modelValue.points} points)` : '') : 'Select Bid' }}</h1></v-col>
        </v-row>
        <v-row v-if="modelValue">
            <v-col cols="3">
                <b>Special</b>
                <div v-for="bid in config.specialBids" :key="bid" @click="setSpecialBid(bid)">{{ bid.name }}</div>
            </v-col>
            <v-col cols="3">
                <b>Tricks</b>
                <div v-for="i in (scoring.maxTricks - scoring.minTricks) + 1" :key="i" @click="setTricks(i - 1 + scoring.minTricks)">{{ i - 1 + scoring.minTricks }}</div>
            </v-col>
            <v-col cols="3">
                <b>Trumps</b>
                <div v-for="suit in config.suits.lowToHigh" :key="suit" @click="setTrumps(suit)">{{ suit.name }}s</div>
                <div @click="setTrumps(null)">NO!</div>
            </v-col>
            <v-col cols="3">
                <b>AntiTrumps</b>
                <div v-for="suit in config.suits.lowToHigh" :key="suit" @click="setAntiTrumps(suit)">{{ suit.name }}s</div>
                <div @click="setAntiTrumps(null)">NO!</div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import DeckConfig from '../src/game/model/DeckConfig.js';
import Bid from '../src/game/model/Bid.js';

export default {
    props: {
        bids: {
            type: Array,
        },
        config: {
            type: DeckConfig,
        },
        scoring: {
            required: true,
        },
    },
    data() {
        return {
            modelValue: null,
        };
    },
    computed: {},
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
        }
    },
    mounted() {
        this.modelValue = new Bid(this.scoring.minTricks, this.config.suits.lowToHigh[0], null, null, 0, this.config);
        this.updateStandardBidPoints()
    },
};
</script>

<style scoped>

</style>
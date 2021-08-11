<template>
    <v-app>
        <v-main>
            <svg width="0" height="0">
                <defs ref="svgDefs"></defs>
            </svg>
            <bid-selector @bid="(bid) => highestBid = bid" :scoring="scoring" :highest-bid="highestBid"></bid-selector>
            <div style="text-align: center;">
                <card-group class="animate-cards fan" v-for="hand in hands" :cards="hand" :key="hand"/>
                <card-group class="animate-cards" :cards="table"></card-group>
            </div>
        </v-main>
    </v-app>
</template>

<script>
import BidSelector from '../components/BidSelector.vue';
import CardGroup from '../components/CardGroup.vue';
import CardSVGBuilder from './view/CardSVGBuilder.js';
import CardSVG from './view/CardSVG.js';
import DeckConfig from './game/model/DeckConfig.js';
import Deck from './game/model/Deck.js';
import OrdinaryNormalDeck from './game/model/OrdinaryNormalDeck.js';
import ScoringAvondale from './game/model/ScoringAvondale.js';

const socket = new WebSocket(window.socketURL);
socket.onopen = () => {
    socket.send('TEST');
    socket.send('TEST2');
};

export default {
    components: {
        CardGroup,
        BidSelector,
    },
    data() {
        this.config = new DeckConfig(OrdinaryNormalDeck.config);
        this.scoring = new ScoringAvondale(this.config);
        return {
            highestBid: null,
            table: [],
            hands: [],
        };
    },
    methods: {
        getSmallestHand() {
            let smallestHand = null;
            for (const hand of this.hands) {
                if (!smallestHand || smallestHand.length > hand.length) {
                    smallestHand = hand;
                }
            }
            return smallestHand;
        },
        takeCardFromGroup(cardSvg) {
            for (const cards of [this.table, ...this.hands]) {
                const index = cards.indexOf(cardSvg);
                if (index >= 0) {
                    cards.splice(index, 1);
                    return cards;
                }
            }
            return null;
        },
        placeCardSomewhereElse(cardSvg, oldGroup) {
            const target = oldGroup !== this.table ? this.table : this.getSmallestHand();
            target.push(cardSvg);
        },
        dealCards() {
            for (let i = 0; i < this.config.totalHands; i++) {
                const hand = [];
                for (let j = 0; j < this.config.cardsPerHand; j++) {
                    hand.push(this.table.pop());
                }
                this.hands.push(hand);
            }
        }
    },
    mounted() {
        this.$refs.svgDefs.innerHTML += OrdinaryNormalDeck.svgDefs;
        const cards = Deck.buildDeck(this.config);
        for (const card of cards) {
            const svg = CardSVGBuilder.getSVG(card, OrdinaryNormalDeck.layout);
            const cardSvg = new CardSVG(card, svg);
            cardSvg.svg.addEventListener('click', () => {
                const oldGroup = this.takeCardFromGroup(cardSvg);
                this.placeCardSomewhereElse(cardSvg, oldGroup);
            });
            this.table.push(Object.freeze(cardSvg));
        }
        this.dealCards();
    },
};
</script>

<style lang="scss">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #fff;
}

:root {
    --suit-red: #c00;
    --suit-black: #ccc;
    --suit-blue: #0040ff;
    --suit-green: #0c0;
}

.v-theme--light.v-theme--light {
    --v-theme-background: 17, 85, 17;
    --v-theme-background-overlay-multiplier: 1;
    --v-theme-surface: 255, 255, 255;
    --v-theme-surface-overlay-multiplier: 1;
    --v-theme-primary: 98, 0, 238;
    --v-theme-primary-overlay-multiplier: 2;
    --v-theme-primary-darken-1: 55, 0, 179;
    --v-theme-primary-darken-1-overlay-multiplier: 2;
    --v-theme-secondary: 3, 218, 198;
    --v-theme-secondary-overlay-multiplier: 1;
    --v-theme-secondary-darken-1: 1, 135, 134;
    --v-theme-secondary-darken-1-overlay-multiplier: 1;
    --v-theme-error: 176, 0, 32;
    --v-theme-error-overlay-multiplier: 2;
    --v-theme-info: 33, 150, 243;
    --v-theme-info-overlay-multiplier: 1;
    --v-theme-success: 76, 175, 80;
    --v-theme-success-overlay-multiplier: 1;
    --v-theme-warning: 251, 140, 0;
    --v-theme-warning-overlay-multiplier: 1;
    --v-theme-on-background: 0, 0, 0;
    --v-theme-on-surface: 0, 0, 0;
    --v-theme-on-primary: 255, 255, 255;
    --v-theme-on-primary-darken-1: 255, 255, 255;
    --v-theme-on-secondary: 0, 0, 0;
    --v-theme-on-secondary-darken-1: 0, 0, 0;
    --v-theme-on-error: 255, 255, 255;
    --v-theme-on-info: 0, 0, 0;
    --v-theme-on-success: 0, 0, 0;
    --v-theme-on-warning: 0, 0, 0;
    --v-border-color: 0, 0, 0;
    --v-border-opacity: 0.12;
    --v-high-emphasis-opacity: 0.87;
    --v-medium-emphasis-opacity: 0.6;
    --v-disabled-opacity: 0.38;
    --v-kbd-background-color: 33, 37, 41;
    --v-kbd-color: 255, 255, 255;
    --v-code-background-color: 194, 194, 194;
}

* {
    color: var(--suit-black)
}

$cardHeight: 150px;

.card {
    border: solid 1px var(--suit-black);
    border-radius: 4px;
    background: #111;
    height: $cardHeight;
    margin: 0.3%;
    padding: 0.1%;
    box-shadow: #000a 2px 2px 4px;
    fill: var(--suit-black);
    stroke: var(--suit-black);
}

.black {
    fill: var(--suit-black);
    stroke: var(--suit-black);
}

.red {
    fill: var(--suit-red);
    stroke: var(--suit-red);
}

.blue {
    fill: var(--suit-blue);
    stroke: var(--suit-blue);
}

.green {
    fill: var(--suit-green);
    stroke: var(--suit-green);
}

.animate-cards .card {
    transition: ease-out transform 444ms;
}

@mixin fan($count, $angle) {
    $offset: -$angle / 2;
    @for $i from 1 through $count {
        $increment: $angle / ($count + 1);
        .card:nth-child(#{$i}) {
            transform: translate(-50%, -50%) rotate($offset + $increment * $i);
        }
    }
}

@mixin allTheFans($counts, $angle) {
    $offset: -$angle / 2;
    @for $count from 1 through $counts {
        .card:first-child:nth-last-child(#{$count}),
        .card:first-child:nth-last-child(#{$count}) ~ .card {
            @for $i from 1 through $count {
                $increment: $angle / ($count + 1);
                &:nth-child(#{$i}) {
                    transform: translate(-50%, 6%) rotate($offset + $increment * $i);
                }
            }
        }
    }
}

.fan {
    width: $cardHeight * 2.2;
    height: $cardHeight * 1.4;
    position: relative;
    display: inline-block;
    @include allTheFans(16, 90deg);

    .card {
        position: absolute;
        transform-origin: 50% 125%;
    }
}
</style>

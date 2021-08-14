<template>
    <div>
        <svg width="0" height="0">
            <defs ref="svgDefs"></defs>
        </svg>
        <bid-selector @bid="(bid) => highestBid = bid" :scoring="scoring" :highest-bid="highestBid" :has-seen-hand="false" :has-leading-bid="false"></bid-selector>
        <div style="text-align: center;">
            <card-group class="animate-cards fan" v-for="hand in hands" :cards="hand" :key="hand"/>
            <card-group class="animate-cards" :cards="table"></card-group>
        </div>
    </div>
</template>

<script>
import BidSelector from '../BidSelector.vue';
import CardGroup from '../CardGroup.vue';
import CardSVGBuilder from '../../src/view/CardSVGBuilder.js';
import CardSVG from '../../src/view/CardSVG.js';
import DeckConfig from '../../src/game/model/DeckConfig.js';
import Deck from '../../src/game/model/Deck.js';
import OrdinaryNormalDeck from '../../src/game/model/OrdinaryNormalDeck.js';
import ScoringAvondale from '../../src/game/model/ScoringAvondale.js';
import WebsocketWrapper from 'ws-wrapper';

const socket = new WebsocketWrapper(new WebSocket(window.socketURL));

// want to send and receive a consistent structure same as socket io {event: 'name', data}
socket.on('open', () => {

    socket.send({woof: 'dogs'});
    socket.send('TEST2');
});

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
        },
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

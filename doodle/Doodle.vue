<template>
    <div>
        <svg width="0" height="0">
            <defs ref="svgDefs"></defs>
        </svg>
        <div style="text-align: center;">
            <card-group class="animate-cards fan" v-for="hand in hands" :cards="hand" :key="hand"/>
            <card-group class="animate-cards" :cards="table"></card-group>
        </div>
    </div>
</template>

<script>
import CardGroup from '../vue/components/CardGroup.vue';
import DeckConfig from '../src/game/model/DeckConfig.js';
import OrdinaryNormalDeck from '../src/game/model/OrdinaryNormalDeck.js';
import Client from '../src/client/Client.js';
import Card from '../src/game/model/Card.js';
import CardSVGBuilder from '../src/view/CardSVGBuilder.js';
import CardSVG from '../src/view/CardSVG.js';

export default {
    components: {
        CardGroup,
    },
    data() {
        this.channel = null;
        this.config = null;
        this.cardMap = new Map();
        return {
            table: [],
            hands: [],
        };
    },
    methods: {
        setConfig(config) {
            this.config = new DeckConfig(config);
        },
        findCardIndex(group, serializedCard) {
            return group.findIndex(cardSvg => cardSvg.card.toString() === serializedCard);
        },
        findCard(serializedCard) {
            for (const group of [this.table, ...this.hands]) {
                const index = this.findCardIndex(group, serializedCard);
                if (index >= 0) {
                    const card = group[index];
                    return [card, group, index];
                }
            }
            return [null, null, -1];
        },
        setCards(groups) {
            const [table, ...hands] = groups;
            this.setGroupCards(this.table, table);
            hands.forEach((hand, index) => {
                if (this.hands.length < index + 1) {
                    this.hands.push([]);
                }
                this.setGroupCards(this.hands[index], hand);
            });
        },
        setGroupCards(thisGroup, otherGroup) {
            otherGroup.forEach((serializedCard, index) => {
                let cardSvg = this.cardMap.get(serializedCard);
                if (!cardSvg) {
                    cardSvg = this.createNewCard(serializedCard);
                }
                if (thisGroup[index] === cardSvg) {
                    return;
                }
                thisGroup[index] = cardSvg;
            });
            if (thisGroup.length > otherGroup.length) {
                thisGroup.splice(otherGroup.length - 1);
            }
        },
        createNewCard(serializedCard) {
            const card = Card.fromString(serializedCard, this.config);
            const svg = CardSVGBuilder.getSVG(card, OrdinaryNormalDeck.layout);
            const cardSvg = new CardSVG(card, svg);
            cardSvg.svg.addEventListener('click', () => this.channel.emit('card', serializedCard));
            Object.freeze(cardSvg);
            this.cardMap.set(card.toString(), cardSvg);
            return cardSvg;
        },
    },
    mounted() {
        this.$refs.svgDefs.innerHTML += OrdinaryNormalDeck.svgDefs;
        const client = Client.client;
        this.channel = client.of('doodle');
        this.channel.on('config', config => this.setConfig(config));
        this.channel.on('cards', cards => this.setCards(cards));
    },
};
</script>

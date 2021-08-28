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
import {ref, onMounted, onUnmounted} from 'vue';
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
    setup() {
        let config = null;
        const svgDefs = ref();
        const table = ref([]);
        const hands = ref([]);
        const client = Client.client;
        const cardMap = new Map();
        let channel = null;

        const createNewCard = (serializedCard) => {
            const card = Card.fromString(serializedCard, config);
            const svg = CardSVGBuilder.getSVG(card, OrdinaryNormalDeck.layout);
            const cardSvg = new CardSVG(card, svg);
            cardSvg.svg.addEventListener('click', () => channel.emit('card', serializedCard));
            Object.freeze(cardSvg);
            cardMap.set(card.toString(), cardSvg);
            return cardSvg;
        };

        const setGroupCards = (thisGroup, otherGroup) => {
            otherGroup.forEach((serializedCard, index) => {
                let cardSvg = cardMap.get(serializedCard);
                if (!cardSvg) {
                    cardSvg = createNewCard(serializedCard);
                }
                if (thisGroup[index] === cardSvg) {
                    return;
                }
                thisGroup[index] = cardSvg;
            });
            if (thisGroup.length > otherGroup.length) {
                thisGroup.splice(otherGroup.length - 1);
            }
        };
        const setCards = groups => {
            const [newTable, ...newHands] = groups;
            setGroupCards(table.value, newTable);
            newHands.forEach((hand, index) => {
                if (hands.value.length < index + 1) {
                    hands.value.push([]);
                }
                setGroupCards(hands.value[index], hand);
            });
        };

        onMounted(() => {
            svgDefs.value.innerHTML += OrdinaryNormalDeck.svgDefs;
            channel = client.of('doodle:doodle');
            channel.on('config', newConfig => config = new DeckConfig(newConfig));
            channel.on('cards', cards => setCards(cards));
        });
        onUnmounted(() => {
            channel.emit('channel:leave');
            channel.removeAllListeners('config');
            channel.removeAllListeners('cards');
        });

        return {
            createNewCard,
            svgDefs,
            table,
            hands,
        };
    },
};
</script>

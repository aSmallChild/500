<template>
    <div>{{ msg }}</div>
    <svg width="0" height="0">
        <defs ref="svgDefs"></defs>
    </svg>
    <card-table ref="table" class="animate-all"></card-table>
    <fan ref="fan1" class="animate-all"></fan>
    <fan ref="fan2" class="animate-all"></fan>
</template>

<script>
import Table from '../components/Table.vue';
import Fan from '../components/Fan.vue';
import CardSVGBuilder from './view/CardSVGBuilder.js';
import CardSVG from './view/CardSVG.js';
import DeckConfig from '../src/game/model/DeckConfig.js';
import Deck from '../src/game/model/Deck.js';
import OrdinaryNormalDeck from '../src/game/model/OrdinaryNormalDeck.js';

const layout = OrdinaryNormalDeck.layout;
const config = new DeckConfig(OrdinaryNormalDeck.config);

export default {
    name: 'App',
    components: {
        'card-table': Table,
        'fan': Fan,
    },
    data() {
        return {
            msg: '',
        };
    },
    mounted() {
        this.$refs.svgDefs.innerHTML += OrdinaryNormalDeck.svgDefs;
        const cards = Deck.buildDeck(config);
        let count = 0;
        for (const card of cards) {
            const svg = CardSVGBuilder.getSVG(card, layout);
            const cardSvg = new CardSVG(card, svg);
            // cardSvg.svg.addEventListener('mouseover', () => {
            //     cardSvg.animateSiblings(() => {
            //         this.$refs.table.playCard(cardSvg);
            //     });
            // });
            cardSvg.svg.addEventListener('click', () => {
                const moveToTable = cardSvg.svg.parentElement !== this.$refs.table.$el;
                cardSvg.animateSiblings(() => {
                    if (moveToTable) {
                        this.$refs.table.playCard(cardSvg);
                    } else {
                        this.$refs.fan1.addCard(cardSvg);
                    }
                });
                this.msg = card.getName() + ' clicked!';
            });
            if (count < 10) {
                this.$refs.fan1.addCard(cardSvg);
            } else if (count < 20) {
                this.$refs.fan2.addCard(cardSvg);
            } else {
                this.$refs.table.playCard(cardSvg);
            }
            count++;
        }
    },
};
</script>

<style lang="scss">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #fff;
    margin-top: 30px;
}

:root {
    --suit-red: #c00;
    --suit-black: #ccc;
    --suit-blue: #0040ff;
    --suit-green: #0c0;
}

* {
    color: var(--suit-black)
}

html {
    background: #151;
}

.card {
    border: solid 2px var(--suit-black);
    border-radius: 4px;
    background: #111;
    //width: 2.5in;
    //height: 3.5in;
    width: 125px;
    height: 175px;
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

.animate-all .card {
    transition: ease-out all 777ms;
}
</style>

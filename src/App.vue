<template>
    <div>{{ msg }}</div>
    <svg width="0" height="0">
        <defs ref="svgDefs"></defs>
    </svg>
    <card-group class="animate-cards" :cards="table"></card-group>
    <card-group class="animate-cards fan" :cards="hand1"></card-group>
    <card-group class="animate-cards fan" :cards="hand2"></card-group>
</template>

<script>
import CardGroup from '../components/CardGroup.vue';
import CardSVGBuilder from './view/CardSVGBuilder.js';
import CardSVG from './view/CardSVG.js';
import DeckConfig from '../src/game/model/DeckConfig.js';
import Deck from '../src/game/model/Deck.js';
import OrdinaryNormalDeck from '../src/game/model/OrdinaryNormalDeck.js';

const layout = OrdinaryNormalDeck.layout;
const config = new DeckConfig(OrdinaryNormalDeck.config);

export default {
    components: {
        CardGroup,
    },
    data() {
        return {
            msg: '',
            table: [],
            hand1: [],
            hand2: [],
        };
    },
    mounted() {
        this.$refs.svgDefs.innerHTML += OrdinaryNormalDeck.svgDefs;
        const cards = Deck.buildDeck(config);
        for (const card of cards) {
            const svg = CardSVGBuilder.getSVG(card, layout);
            const cardSvg = new CardSVG(card, svg);
            cardSvg.svg.addEventListener('click', () => {
                let index = -1;
                let current = null;
                for (const array of [this.table, this.hand1, this.hand2]) {
                    index = array.indexOf(cardSvg);
                    if (index >= 0) {
                        current = array;
                        break;
                    }
                }

                const target = current === this.table ? this.hand1 : this.table;
                if (!current) {
                    return;
                }
                current.splice(index, 1);
                target.push(cardSvg);
                this.msg = card.getName() + ' clicked!';
            });
            this.table.push(cardSvg);
        }
        for (let i = 0; i < 10; i++) {
            this.hand1.push(this.table.pop());
        }
        for (let i = 0; i < 10; i++) {
            this.hand2.push(this.table.pop());
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
    transition: ease-out transform 777ms;
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
    @include allTheFans(16, 90deg);

    .card {
        position: absolute;
        transform-origin: 50% 125%;
    }
}
</style>

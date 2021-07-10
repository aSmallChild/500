<template>
    <div>{{ msg }}</div>
    <svg width="0" height="0">
        <defs ref="svgDefs"></defs>
    </svg>
    <card-group class="animate-cards" :cards="table"></card-group>
    <card-group class="animate-cards fan" v-for="hand in hands" :cards="hand" :key="hand"/>
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
            hands: [],
        };
    },
    mounted() {
        this.$refs.svgDefs.innerHTML += OrdinaryNormalDeck.svgDefs;
        const cards = Deck.buildDeck(config);
        for (const card of cards) {
            const svg = CardSVGBuilder.getSVG(card, layout);
            const cardSvg = new CardSVG(card, svg);
            cardSvg.svg.addEventListener('click', () => {
                this.msg = card.getName() + ' clicked!';
                let index = -1;
                let current = null;
                for (const array of [this.table, ...this.hands]) {
                    index = array.indexOf(cardSvg);
                    if (index >= 0) {
                        current = array;
                        break;
                    }
                }

                if (current) {
                    current.splice(index, 1);
                }
                let target = current !== this.table ? this.table : null;
                if (!target) {
                    for (const hand of this.hands) {
                        if (!target || target.length > hand.length) {
                            target = hand;
                        }
                    }
                }
                target.push(cardSvg.freeze());
            });
            this.table.push(cardSvg.freeze());
        }

        for (let i = 0; i <= (this.table.length / config.totalHands); i++) {
            const hand = [];
            for (let j = 0; j < config.cardsPerPlayer; j++) {
                hand.push(this.table.pop());
            }
            this.hands.push(hand);
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
    display: inline-block;
    @include allTheFans(16, 90deg);

    .card {
        position: absolute;
        transform-origin: 50% 125%;
    }
}
</style>

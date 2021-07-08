<template>
    <div>{{ msg }}</div>
    <svg width="0" height="0">
        <defs ref="svgDefs"></defs>
    </svg>
    <card-table ref="table" class="animate-cards"></card-table>
    <card-group ref="fan1" class="animate-cards fan"></card-group>
    <card-group ref="fan2" class="animate-cards fan"></card-group>
<!--    <card-group class="animate-cards fan" v-for="hand in hands" :cards="hand" :key="hand"></card-group>-->
</template>

<script>
import CardTable from '../components/CardTable.vue';
import CardGroup from '../components/CardGroup.vue';
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
        CardTable,
        CardGroup,
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
                cardSvg.animateTo(() => {
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

<template>
  <card-svg-defs :def="svgDefs"/>
  <div style="margin: 2.5rem">
    <card-group fan v-for="hand in hands" :cards="hand" :key="hand" @card-svg="onCardClicked" draggable-cards animate
                @card-drop="cardDropped($event, hand)"/>

    <card-group pile :cards="table" @card-svg="onCardClicked" draggable-cards class="table" animate
                @card-drop="cardDropped($event, table)"/>
  </div>
</template>

<script setup>
import Card from 'lib/game/model/Card.js';
import CardGroup from '../../components/CardGroup.vue';
import CardSvgDefs from '../../components/CardSvgDefs.vue';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import CardSVGBuilder from 'lib/view/CardSVGBuilder.js';
import CardSVG from 'lib/view/CardSVG.js';
import DeckConfig from 'lib/game/model/DeckConfig.js';
import {ref} from 'vue';

const config = new DeckConfig(OrdinaryNormalDeck.config);
const svgDefs = OrdinaryNormalDeck.svgDefs;
const table = ref([]);
const hands = ref([]);
const cardMap = new Map();

const onCardClicked = card => card.flip();
const cardDropped = ({cardId, onCard}, toGroup) => {
  const card = cardMap.get(cardId);
  if (!card) {
    return;
  }

  const [fromGroup, fromIndex] = findGroupWithCard(card);
  if (!fromGroup) {
    return;
  }

  let toIndex = onCard ? toGroup.indexOf(onCard) : -1;
  toIndex++;

  fromGroup.splice(fromIndex, 1);
  if (fromGroup == toGroup && toIndex > fromIndex) {
    toIndex--;
  }

  toGroup.splice(toIndex, 0, card);
};

const createNewCard = (serializedCard) => {
  const existingCard = cardMap.get(serializedCard);
  if (existingCard) return existingCard;
  const card = Card.fromString(serializedCard, config);
  const svg = CardSVGBuilder.getSVG(card, OrdinaryNormalDeck.layout);
  const cardSvg = new CardSVG(card, svg);
  Object.freeze(cardSvg);
  cardMap.set(card.toString(), cardSvg);
  return cardSvg;
};

const setGroupCards = (thisGroup, otherGroup) => {
  otherGroup.forEach((serializedCard, index) => {
    const cardSvg = createNewCard(serializedCard);
    if (thisGroup[index] === cardSvg) {
      return;
    }
    thisGroup[index] = cardSvg;
  });
  if (thisGroup.length > otherGroup.length) {
    thisGroup.splice(otherGroup.length);
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

const findGroupWithCard = card => {
  for (const group of [table.value, ...hands.value]) {
    const index = group.indexOf(card);
    if (index > -1) {
      return [group, index];
    }
  }
  return [null, null];
};

setCards(
    [
      ['HA', 'DA', 'SA', 'CA'],
      ['HK', 'DK', 'SK', 'CK'],
      ['HQ', 'DQ', 'SQ', 'CQ'],
      ['HJ', 'DJ', 'SJ', 'CJ'],
    ]
);
</script>

<style scoped>
.table {
  min-width: 400px;
  min-height: 400px;
  background-color: saddlebrown;
  padding: 2.5em;
}
</style>
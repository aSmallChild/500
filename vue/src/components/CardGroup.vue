<script setup>
import {nextTick, onMounted, ref, watch} from 'vue';

const props = defineProps({
  cards: Array,
  fan: {
    type: Boolean,
    default: false,
  },
  pile: {
    type: Boolean,
    default: false,
  },
  animate: {
    type: Boolean,
    default: true,
  },
  draggableCards: {
    type: Boolean,
    default: false,
  },
  selfClearing: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  'card',
  'card-svg',
  'card-drop',
  // todo might be useful to have a onCardLeave/dragend event so the parent knows where the card has come from
]);
defineExpose({clear});
//todo write some random transforms for piles
const root = ref(null);

watch(() => props.cards, (newCards, oldCards) => {
  if (props.selfClearing) {
    for (const oldCard of oldCards) {
      if (!newCards.includes(oldCard)) {
        oldCard.svg.remove();
      }
    }
  }
  placeCards(newCards);
});
onMounted(() => placeCards(props.cards));

function findCardByElement(ele) {
  return props.cards.find(card => card.svg === ele);
}

function findCardByChildElement(ele) {
  if (ele === root.value) return;
  return findCardByElement(ele) || props.cards.find(card => card.svg.contains(ele));
}

function getCardsAlreadyPlaced() {
  if (!root.value.children) {
    return [];
  }
  const cardsAlreadyHere = [];
  for (const svg of root.value.children) {
    const card = findCardByElement(svg);
    if (card) {
      cardsAlreadyHere.push(card);
    }
  }
  return cardsAlreadyHere;
}

function onDragStart(event) {
  const cardSvg = findCardByChildElement(event.target);
  if (!cardSvg) return;
  event.dataTransfer.dropEffect = 'move';
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('cardId', cardSvg.card.id);
  event.dataTransfer.setData('text/plain', cardSvg.card.getName());
}

function onDrop(event) {
  const cardId = event.dataTransfer.getData('cardId');
  if (!cardId) return;
  const onCard = findCardByChildElement(event.target);
  if (onCard && onCard.card.toString() === cardId) return;
  emit('card-drop', {cardId, onCard});
  placeCards(props.cards);
}

function onClick(event) {
  const cardSvg = findCardByChildElement(event.target);
  if (!cardSvg) return;
  emit('card', cardSvg.card);
  emit('card-svg', cardSvg);
}

function placeCards(cards) {
  if (!root.value) return;
  if (!cards.length) return;
  const cardsAlreadyHere = getCardsAlreadyPlaced();
  const callbacks = [];
  for (let i = 0; i < cards.length; i++) {
    const cardSvg = cards[i];
    if (props.draggableCards) {
      cardSvg.svg.setAttribute('draggable', true);
    }
    else {
      cardSvg.svg.removeAttribute('draggable');
    }
    if (cardsAlreadyHere[i] === cardSvg) continue;
    callbacks.push(cardSvg.animateTo(() => {
      if (!i) return root.value.prepend(cardSvg.svg);
      if (i === cards.length - 1) return root.value.append(cardSvg.svg);
      const previousCard = cards[i - 1].svg;
      previousCard.parentNode.insertBefore(cardSvg.svg, previousCard.nextSibling);
    }));
  }
  if (!callbacks.length) return;
  nextTick(() => {
    setTimeout(() => {
      for (const callback of callbacks) {
        callback();
      }
    }, 7);
  });
}

// note: there may be cards inside this component that don't belong here
// the parent component is responsible for deciding how cards are moved
// we don't know the order that each card will be moved in, it could be handled after this is run
// and if we get rid of it here without knowing where to move it to, it will break animations
// unless told to clear, cards in this component that aren't in the prop are welcome to stay
function clear() {
  const remove = [];
  for (const element of root.value.children) {
    if (!findCardByElement(element)) {
      remove.push(element);
    }
  }
  remove.forEach(element => element.remove());
}
</script>

<template>
  <div ref="root"
       :class="{fan, 'animate-cards': animate}"
       :style="{'--fan-cards': cards.length}"
       @click="onClick"
       @drop.prevent="onDrop"
       @dragstart="onDragStart"
       @dragover.prevent
       @dragenter.prevent
  />
</template>
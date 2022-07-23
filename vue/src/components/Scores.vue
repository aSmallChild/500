<script setup>
import {computed} from 'vue';

const props = defineProps({
  scores: Array,
  players: Array
});

const playerScores = computed(() =>
    props.scores
        .map((score, i) => [props.players[i], score])
        .sort((a, b) => b[1] - a[1])
);
</script>

<template>
  <div>
    Scores:
    <ol>
      <li v-for="[player, score] in playerScores">
        {{ score }} - {{ player.name }}
      </li>
    </ol>
  </div>
</template>
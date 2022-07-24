<script setup>
import {computed, h} from 'vue';

const props = defineProps({
  scores: Array,
  players: Array,
  roundScores: Array
});

const playerScores = computed(() =>
    props.scores
        .map((score, i) => [props.players[i], score, props.roundScores ? props.roundScores[i] : 0])
        .sort((a, b) => b[1] - a[1])
);

function getScoreClass(score) {
  return 'score' + (score > 0 ? '-positive' : (score < 0 ? '-negative' : ''));
}

function Score(props) {
  const score = props.score;
  return h('span', {class: getScoreClass(score)}, (props.delta && score > 0 ? '+' : '') + score);
}
</script>

<template>
  <div>
    Scores:
    <ol>
      <li v-for="[player, score, roundScore] in playerScores">
        {{ player.name }}&nbsp;<score :score="score"/><template v-if="roundScore">&nbsp;(<score :score="roundScore" :delta="true"/>)</template>
      </li>
    </ol>
  </div>
</template>

<style>
.score-positive {
  color: #80ff80;
}

.score-negative {
  color: #ff7171;
}

.score {

}
</style>
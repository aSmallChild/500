<script setup>
import { ref } from 'vue';

const shadowAngleDeg = ref(0);
const shadowDistancePx = ref(60);
const parentAngleDeg = ref(0);
const childAngleDeg = ref(0);
</script>

<template>
  <div :style="{'--shadow-angle': shadowAngleDeg + 'deg', '--shadow-distance': shadowDistancePx + 'px'}">
    <label>
      <span>
        <span>Shadow angle ({{ shadowAngleDeg }}°)</span>
        <input type="number" v-model="shadowAngleDeg" min="-720" max="720" step="5"/>
      </span>
      <input type="range" v-model="shadowAngleDeg" min="-720" max="720" step="5"/>
    </label>
    <label>
      <span>
        <span>Shadow distance</span>
        <input type="number" v-model="shadowDistancePx" min="0" max="1000" step="1"/>
      </span>
      <input type="range" v-model="shadowDistancePx" min="0" max="1000" step="1"/>
    </label>
    <label>
      <span>
        <span>Parent angle</span>
        <input type="number" v-model="parentAngleDeg" min="-720" max="720" step="5"/>
      </span>
      <input type="range" v-model="parentAngleDeg" min="-720" max="720" step="5"/>
    </label>
    <label>
      <span>
        <span>Child angle</span>
        <input type="number" v-model="childAngleDeg" min="-720" max="720" step="5"/>
      </span>
      <input type="range" v-model="childAngleDeg" min="-720" max="720" step="5"/>
    </label>
    <div class="background">
      <div class="parent static-shadow" :style="{'--rotate': parentAngleDeg + 'deg'}">
        Parent {{ parentAngleDeg }}°
        <div class="child static-shadow" :style="{'--rotate': childAngleDeg + 'deg'}">
          Child {{ childAngleDeg }}°
        </div>
      </div>
      <div class="parent static-shadow" :style="{'--rotate': parentAngleDeg + 'deg'}">
        Parent {{ parentAngleDeg }}°
        <div class="child static-shadow" style="border-radius: 50%" :style="{'--rotate': childAngleDeg + 'deg'}">
          Child {{ childAngleDeg }}°
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
  margin: 1rem;
  min-width: 360px;
}

label > span {
  display: flex;
  flex: 1;
}

label > span > span {
  width: 10rem;
}

label > span > input {
  width: 10rem;
}

label > input {
  width: clamp(15rem, 50vw, 60rem);
}

div {
  /* not sure what to do about animations, easing the rotation means the shadow is on the wrong angle during the transition and easing the filter means the rotation of the shadow during the animation does not match the actual rotation */
  transition: 2.5s rotate ease-out, 2.5s filter ease-out, 2.5s background-color linear;
}

.background {
  color: #000;
  display: flex;
  flex-direction: row;
  gap: 12rem;
  padding: 6rem;
  height: 30rem;
  margin: 3rem;
  background: #00cc00;
}

.parent {
  display: flex;
  flex-direction: row;

  padding: 3rem;
  width: 18rem;
  height: 18rem;
  background: #ffcc00;
  --parent-rotate: var(--rotate);
  --shadow-angle-offset: var(--rotate);
  rotate: var(--rotate);
}

.child {
  justify-self: center;
  align-self: center;
  width: 9rem;
  height: 9rem;
  padding: 3rem;
  background: #ff6600;

  --shadow-angle-offset: calc(var(--rotate) + var(--parent-rotate));
  rotate: var(--rotate);
}

.static-shadow {
  --drop-ʘ: calc(var(--shadow-angle, 45deg) - var(--shadow-angle-offset, 0deg));
  --drop-x: calc(cos(var(--drop-ʘ)) * var(--shadow-distance));
  --drop-y: calc(sin(var(--drop-ʘ)) * var(--shadow-distance));
  filter: drop-shadow(var(--drop-x) var(--drop-y) calc(0.1 * var(--shadow-distance)) var(--shadow-color, #000c));
}
</style>

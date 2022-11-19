<template>
  <br>
  <div style="display: flex; flex-direction: column; align-items: center">
    <h3>I hope you like <span style="color: tomato">tomato</span> and <span style="color: turquoise">turquiose</span></h3>
    <div class="round-layout" style="--rl-items: 6">
      <div class="rl-item">A</div>
      <div class="rl-item">B</div>
      <div class="rl-item">C</div>
      <div class="rl-item">D</div>
      <div class="rl-item">E</div>
      <div class="rl-item">F</div>
      <div class="rl-center">standard 6</div>
    </div>
    <div class="round-layout" style="--rl-items: 6">
      <div class="rl-item">A <span class="rl-level">A</span></div>
      <div class="rl-item">B <span class="rl-level">A</span></div>
      <div class="rl-item">C <span class="rl-level">A</span></div>
      <div class="rl-item">D <span class="rl-level">A</span></div>
      <div class="rl-item">E <span class="rl-level">A</span></div>
      <div class="rl-item">F <span class="rl-level">A</span></div>
      <div class="rl-center">level nested children</div>
    </div>
    <div class="round-layout" style="--rl-items: 12">
      <div class="rl-item">A</div>
      <div class="rl-item">B</div>
      <div class="rl-item">C</div>
      <div class="rl-item">D</div>
      <div class="rl-item">E</div>
      <div class="rl-item">F</div>
      <div class="rl-item">G</div>
      <div class="rl-item">H</div>
      <div class="rl-item">I</div>
      <div class="rl-item">J</div>
      <div class="rl-item">K</div>
      <div class="rl-item">L</div>
      <div class="rl-center">max 12</div>
    </div>
    <div class="round-layout" style="--rl-items: 6">
      <div class="rl-item rl-level">A<span class="rl-level">A</span></div>
      <div class="rl-item rl-level">B<span class="rl-level">A</span></div>
      <div class="rl-item rl-level">C<span class="rl-level">A</span></div>
      <div class="rl-item rl-level">D<span class="rl-level">A</span></div>
      <div class="rl-item rl-level">E<span class="rl-level">A</span></div>
      <div class="rl-item rl-level">F<span class="rl-level">A</span></div>
      <div class="rl-center">all level</div>
    </div>
    <div class="round-layout" style="--rl-items: 2">
      <div class="rl-item">A<span class="rl-level">A</span></div>
      <div class="rl-item">B<span class="rl-level">A</span></div>
    </div>
    <div class="round-layout" style="--rl-items: 3">
      <div class="rl-item rl-level">A</div>
      <div class="rl-item rl-level">B</div>
      <div class="rl-item rl-level">C</div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.round-layout {
  margin: 2.5em;
  border: solid 5px tomato;

  > .rl-item {
    border-bottom: solid 5px tomato;
    box-shadow: #aaaa 0 0 20px;
  }

  > .rl-center {
    background: turquoise;
  }

  > div {
    text-align: center;
    background: turquoise;
    color: black
  }
}

.rl-level {
  border-bottom: solid 5px tomato;
  background: white;
}
</style>
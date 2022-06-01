<template>
    <br>
    <div style="display: flex; flex-direction: column; align-items: center">
        <h3>I hope you like <span style="color: tomato">tomato</span> and <span style="color: turquoise">turquiose</span></h3>
        <div class="round-layout" style="--rl-items: 6">
            <div>A</div>
            <div>B</div>
            <div>C</div>
            <div>D</div>
            <div>E</div>
            <div>F</div>
            <span>standard 6</span>
        </div>
        <div class="round-layout" style="--rl-items: 6">
            <div>A <span class="rl-level">A</span></div>
            <div>B <span class="rl-level">A</span></div>
            <div>C <span class="rl-level">A</span></div>
            <div>D <span class="rl-level">A</span></div>
            <div>E <span class="rl-level">A</span></div>
            <div>F <span class="rl-level">A</span></div>
            <span>level nested children</span>
        </div>
        <div class="round-layout" style="--rl-items: 12">
            <div>A</div>
            <div>B</div>
            <div>C</div>
            <div>D</div>
            <div>E</div>
            <div>F</div>
            <div>G</div>
            <div>H</div>
            <div>I</div>
            <div>J</div>
            <div>K</div>
            <div>L</div>
            <span>max 12</span>
        </div>
        <div class="round-layout" style="--rl-items: 6">
            <div class="rl-level">A<span class="rl-level">A</span></div>
            <div class="rl-level">B<span class="rl-level">A</span></div>
            <div class="rl-level">C<span class="rl-level">A</span></div>
            <div class="rl-level">D<span class="rl-level">A</span></div>
            <div class="rl-level">E<span class="rl-level">A</span></div>
            <div class="rl-level">F<span class="rl-level">A</span></div>
            <span>all level</span>
        </div>
        <div class="round-layout" style="--rl-items: 2">
            <div>A<span class="rl-level">A</span></div>
            <div>B<span class="rl-level">A</span></div>
        </div>
        <div class="round-layout" style="--rl-items: 3">
            <div class="rl-level">A</div>
            <div class="rl-level">B</div>
            <div class="rl-level">C</div>
        </div>

    </div>
</template>

<script>
export default {
    name: 'circle',
};
</script>

<style lang="scss">
.round-layout {
    --rl-diameter: 400px;
    --rl-size: 20px;
    --rl-padding: 10px;
    width: var(--rl-diameter);
    height: var(--rl-diameter);
    min-height: var(--rl-diameter);
    min-width: var(--rl-diameter);
    flex: 0;
    margin: 2.5em;
    border: solid 5px tomato;
    border-radius: 50%;
    display: flex;
    position: relative;

    > div {
        padding: var(--rl-padding);
        height: var(--rl-size);
        width: var(--rl-size);
        --rl-angle: calc(360deg / var(--rl-items));
        --rl-translate: calc((var(--rl-diameter) - var(--rl-size)) / 2 - var(--rl-padding));
        position: absolute;
        border-bottom: solid 5px tomato;
        box-shadow: #aaaa 0 0 20px;

        @for $i from 1 through 12 {
            &:nth-of-type(#{$i}) {
                transform: translate(var(--rl-translate), var(--rl-translate)) rotate(calc(#{$i - 1} * var(--rl-angle) + 90deg)) translate(var(--rl-translate)) rotate(-90deg);

                &.rl-level {
                    transform: translate(var(--rl-translate), var(--rl-translate)) rotate(calc(#{$i - 1} * var(--rl-angle) + 90deg)) translate(var(--rl-translate)) rotate(calc(-#{$i - 1} * var(--rl-angle) - 90deg));

                    .rl-level {
                        transform: none;
                    }
                }

                .rl-level {
                    transform: rotate(calc(-#{$i - 1} * var(--rl-angle)));
                }
            }
        }
    }

    > span {
        top: 50%;
        left: 50%;
        position: absolute;
        padding: 0;
        background: green;
    }

    > div {
        text-align: center;
        background: turquoise;
        color: black
    }
}

.rl-level {
    position: absolute;
    border-bottom: solid 5px tomato;
    background: white;
}
</style>
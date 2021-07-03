<template>
    <div class="fan"></div>
</template>

<script>
export default {
    name: 'Fan',
    methods: {
        addCard(cardSvg) {
            if (!cardSvg.svg.parentElement) {
                this.$el.appendChild(cardSvg.svg);
                return;
            }
            cardSvg.animateSiblings(() => {
                this.$el.appendChild(cardSvg.svg);
            });
        },
    },
};
</script>

<style lang="scss">
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
                    transform: translate(-50%, -50%) rotate($offset + $increment * $i);
                }
            }
        }
    }
}

.fan {
    width: 300px;
    height: 200px;
    left: 50%;
    top: 50%;
    position: relative;
    @include allTheFans(16, 90deg);

    //&:hover {
    //    @include allTheFans(53, 180deg);
    //
    //    .card {
    //        transition: all ease 0.1s;
    //    }
    //}

    .card {
        position: absolute;
        left: 50%;
        top: 50%;
        transform-origin: center 120%;
    }
}
</style>
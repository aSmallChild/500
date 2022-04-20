<template>
    <svg width="0" height="0">
        <defs ref="svgDefs"></defs>
    </svg>
</template>

<script>
import {onMounted, ref} from 'vue';

export default {
    name: 'CardSvgDefs',
    props: {
        def: String
    },
    setup(props) {
        const svgDefs = ref();
        onMounted(async () => {
            svgDefs.value.innerHTML = props.def;
        });
        return {svgDefs};
    }
};
</script>
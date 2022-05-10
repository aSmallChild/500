import {defineConfig} from 'vite';
import vuePlugin from '@vitejs/plugin-vue';

function removeDataTestAttrs(node) {
    if (node.type === 1 /* NodeTypes.ELEMENT */) {
        node.props = node.props.filter(prop => prop.type === 6 /* NodeTypes.ATTRIBUTE */ ? prop.name !== 'data-test' : true);
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vuePlugin({
            template: {
                compilerOptions: {
                    nodeTransforms: [removeDataTestAttrs],
                },
            },
        })],
});
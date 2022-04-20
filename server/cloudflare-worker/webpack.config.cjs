const path = require('path');

module.exports = {
    mode: 'production',
    optimization: {
        minimize: false
    },
    experiments: {
        outputModule: true,
    },
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.bundle.mjs',
        asyncChunks: true,
        chunkFormat: 'array-push',
        library: {
            type: 'module',
        },
    },
    target: "webworker",
};


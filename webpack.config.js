const path = require('path');

module.exports = {
    entry: './src/js/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'src'),
    },
    watch: true,
    watchOptions: {
        ignored: '/node_modules/',
    },
};

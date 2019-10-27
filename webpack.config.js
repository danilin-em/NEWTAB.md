const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    devtool: 'sourcemap',
    entry: './src/main.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js'],
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                context: './src',
                from: '*',
                ignore: '*.js',
            },
            {
                from: 'src/assets',
                to: 'assets',
            },
        ]),
    ],
    optimization: {
        concatenateModules: true,
    },
};

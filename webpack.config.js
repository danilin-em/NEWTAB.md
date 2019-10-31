const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

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
        new StylelintPlugin({
            files: [
                './src/*.css',
            ],
        }),
    ],
    optimization: {
        concatenateModules: true,
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000,
    },
};

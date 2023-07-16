const webpack = require("webpack");
const webpackConfigMerger = require("webpack-config-merger");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = webpackConfigMerger(require("./config"), {
    mode: "production",
    optimization: {
        minimize: false
    },
    output: {
        filename: "sir-trevor.js"
    },
    plugins: [new MiniCssExtractPlugin({filename: "sir-trevor.css"})],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {}
                    },
                    {
                        loader: "sass-loader",
                    }
                ]
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {}
                    }
                ]
            }
        ]
    }
});

module.exports = config;

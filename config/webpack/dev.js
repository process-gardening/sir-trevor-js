const webpack = require("webpack");
const webpackConfigMerger = require("webpack-config-merger");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = webpackConfigMerger(require("./config"), {
    devtool: "source-map",
    mode: "development",
    output: {
        filename: "sir-trevor.debug.js"
    },
    plugins: [new MiniCssExtractPlugin({filename: "sir-trevor.debug.css"})],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {sourceMap: true}
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                        }
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
            //loader: ExtractTextPlugin.extract("file?name=[name].debug.[ext]")
        ]
    }
});

module.exports = config;

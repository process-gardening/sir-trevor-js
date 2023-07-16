const webpack = require("webpack");
const webpackConfigMerger = require("webpack-config-merger");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const banner = [
    "/*!",
    " * Sir Trevor JS v<%= pkg.version %>",
    " *",
    " * Released under the MIT license",
    " * www.opensource.org/licenses/MIT",
    " *",
    ' * <%= grunt.template.today("yyyy-mm-dd") %>',
    " */\n\n"
].join("\n");

module.exports = webpackConfigMerger(require("./config"), {
  mode: "production",
  optimization: {
    minimize: true
  },
  output: {
    filename: "sir-trevor.min.js"
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "sir-trevor.min.css" }),
    new webpack.BannerPlugin({ banner: banner, raw: true })
  ],
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
      //loader: ExtractTextPlugin.extract("file?name=[name].[ext]")
    ]
  }
});

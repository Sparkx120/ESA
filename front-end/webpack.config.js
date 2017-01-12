var path = require('path');
var webpack = require('webpack');
var WebpackCleanupPlugin = require("webpack-cleanup-plugin");

module.exports = {
  entry: './react/index.jsx',
  output: { path: __dirname + '/www', filename: 'bundle.js' },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ["style", "css", "resolve-url", "sass?sourceMap"]
      },
			{
				test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', "es2016", "es2017", "react"],
          plugins: ["transform-class-properties"]
        }
			}
    ]
  },
  plugins: [
    new WebpackCleanupPlugin({
      exclude: ["index.html"], //Include any important stuff here
    })
  ]
}
var path = require('path');
var webpack = require('webpack');

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
          presets: [ 'es2015', 'react' ]
        }
			}
    ]
  },
  plugins: []
}
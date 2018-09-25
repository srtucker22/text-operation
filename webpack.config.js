const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader',
      exclude: /node_modules/,
    }],
  },
};

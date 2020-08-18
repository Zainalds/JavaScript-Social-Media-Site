//Look for a file so where our frontend js 
//where is should export or bundle them into
//any additional features they should use

const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './frontend-js/main.js',//where
  output: {
    filename: 'main-bundled.js',
    path: path.resolve(__dirname, 'public')//export
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', //write ultra modern js by any web browser
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
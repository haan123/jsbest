const webpack = require('webpack');
const path = require('path');

module.exports = {
  context: path.join(__dirname, 'src/js'),
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.ProvidePlugin({
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    })
  ],
  resolve: {
    modulesDirectories: [
      path.resolve(__dirname, 'src/js'),
      path.resolve(__dirname, 'node_modules')
    ],
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['es2015'],
          plugins: [
            // reduce tranpiled code
            [
              "transform-runtime", {
                "polyfill": false,
                "regenerator": false
              }
            ]
          ]
        }
      }
    ]
  },
  entry: {
    "main": ["main.js"],
    "search": ["search.js"],
    "vendor": [
      "lodash",
      "prismjs",
      'hogan.js',
      "bluebird",
      path.join(__dirname, "node_modules/prismjs/components/prism-javascript.js")
    ]
  },
  output: {
    path: path.join(__dirname, 'public/js'),
    filename: '[name].js',
    publicPath: '/js/'
  }
};

var path            = require('path');
var webpack         = require('webpack');

module.exports = function(env) {
  var jsSrc = path.resolve('./src', 'scripts');
  var jsDest = path.resolve('./assets', 'scripts');
  var publicPath = path.join('scripts', '/');
  var filenamePattern = env === 'production' ? '[name]-[hash].js' : '[name].js';
  var extensions = ['js'].map(function(extension) {
    return '.' + extension;
  });

  var webpackConfig = {
    context: jsSrc,
    plugins: [],
    resolve: {
      root: jsSrc,
      extensions: [''].concat(extensions)
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
              ["transform-runtime", {
                "polyfill": false,
                "regenerator": false
              }]
            ]
          }
        }
      ]
    }
  };

  if(env !== 'test') {
    // Karma doesn't need entry points or output settings
    // webpackConfig.entry = {
    //   "docs": "./docs.js",
    //   "main": "./main.js",
    //   "vendor": [
    //     "jquery",
    //     "prismjs",
    //     "../../node_modules/prismjs/components/prism-scss.js",
    //     "underscore",
    //     "backbone"
    //   ]
    // };

    webpackConfig.entry = {
      "main": "./main.js",
      "vendor": ["lodash", "codemirror", "../../node_modules/codemirror/mode/javascript/javascript.js",
      "../../node_modules/codemirror/mode/xml/xml.js",
      "../../node_modules/codemirror/addon/edit/closebrackets.js",
      "prismjs", "hogan.js",
      "../../node_modules/prismjs/components/prism-javascript.js",
    ]
    };

    webpackConfig.output= {
      path: path.normalize(jsDest),
      filename: filenamePattern,
      publicPath: publicPath
    };

    // Factor out common dependencies into a shared.js
    webpackConfig.plugins.push(
      new webpack.optimize.DedupePlugin(),
      new webpack.ProvidePlugin({}),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity
      })
    );
  }

  if(env === 'development') {
    webpackConfig.devtool = 'source-map';
    webpack.debug = true;
  }

  if(env === 'production') {
    webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.NoErrorsPlugin()
    );
  }

  return webpackConfig;
};

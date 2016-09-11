var path            = require('path');
var webpack         = require('webpack');
var fs = require('fs');

module.exports = function(env) {
  var jsSrc = path.resolve('./src', 'js');
  var jsDest = path.resolve('./public', 'js');
  var publicPath = path.join('js', '/');
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
    webpackConfig.entry = {
      "main": "./main.js",
      "search": "./search.js",
      "vendor": ["lodash", "prismjs", 'hogan.js',
      "../../node_modules/prismjs/components/prism-javascript.js", "bluebird"]
    };

    webpackConfig.output= {
      path: path.normalize(jsDest),
      filename: filenamePattern,
      publicPath: publicPath
    };

    // Factor out common dependencies into a shared.js
    webpackConfig.plugins.push(
      new webpack.optimize.DedupePlugin(),
      new webpack.ProvidePlugin({
      }),
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
    let WebPackManifest = function(publicPath, dest, filename) {
      return function() {
        this.plugin("done", function(stats) {
          stats = stats.toJson();
          var chunks   = stats.assetsByChunkName;
          var manifest = {};

          for (var key in chunks) {
            manifest[path.join('./js', key + '.js')] = path.join('./js', chunks[key]);
          }

          fs.writeFileSync(path.join(process.cwd(), './public/rev-manifest.json'), JSON.stringify(manifest));
        });
      };
    };

    webpackConfig.plugins.push(new WebPackManifest(publicPath, './public'));

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

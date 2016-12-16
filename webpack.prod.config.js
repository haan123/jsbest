const baseConfig = require('./webpack.base.config');
const webpack         = require('webpack');
const path            = require('path');
const fs = require('fs');

let WebPackManifest = function(publicPath, dest, filename) {
  return function() {
    this.plugin("done", function(stats) {
      let chunks   = stats.toJson().assetsByChunkName;
      let manifest = {};

      for (let key in chunks) {
        manifest[path.join('js', key + '.js')] = path.join('js', chunks[key]);
      }

      // Write manifest file to /public folder
      fs.writeFileSync(
        path.join(__dirname, 'public/rev-manifest.json'),
        JSON.stringify(manifest)
      );
    });
  };
};

module.exports = Object.assign({}, baseConfig, {
  // Extend base plugins
  plugins: baseConfig.plugins.concat([
    new WebPackManifest('/js/', 'public'),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.NoErrorsPlugin()
  ])
});

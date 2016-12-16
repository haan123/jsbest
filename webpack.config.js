const baseConfig = require('./webpack.base.config');
const webpack = require('webpack');

webpack.debug = true;

for (var key in baseConfig.entry) {
  var entry = baseConfig.entry[key]

  if( key !== 'vendor' ) {
    baseConfig.entry[key] = ['webpack-hot-middleware/client?&reload=true'].concat(entry)
  }
}

module.exports = Object.assign({}, baseConfig, {
  // Extend base plugins
  plugins: baseConfig.plugins.concat([
    new webpack.HotModuleReplacementPlugin()
  ]),
  devtool: 'inline-source-map'
});

const webpackDevConfig = require('../../webpack.config.js');
const webpackProdConfig = require('../../webpack.prod.config.js');

module.exports = function(gulp, plugins) {

  gulp.task('webpack', function(callback) {
    let config = plugins.util.env.dev ? webpackDevConfig : webpackProdConfig;

    plugins.webpack(config, function(err, status) {
      let statColor = status.compilation.warnings.length < 1 ? 'green' : 'yellow';

      if( err ) {
        status.compilation.errors.forEach(handleErrors);
      } else {
        plugins.util.log(plugins.util.colors[statColor](status));
        plugins.util.log('Compiled with', plugins.util.colors.cyan('webpack'), 'in', plugins.util.colors.magenta(status.endTime - status.startTime));
      }

      callback();
    })
  });
};

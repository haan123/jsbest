/**
 * Live reload server.
 */
const webpackConfig = require('../../webpack.config.js');

module.exports = function(gulp, plugins) {

    gulp.task('serve:watch', function() {
      // Compile SCSS files
      gulp.watch('src/scss/**/*.scss', ['scss']);
      // Compile HTML files
      gulp.watch('src/html/*.html', ['html']);

      // gulp.watch([
      //   'public/js/*.js'
      // ]).on('change', plugins.browserSync.reload);
    });

    gulp.task('serve:start', function() {
      let compiler = plugins.webpack(webpackConfig);
      let server = {
        baseDir: plugins.util.env.root || 'public',
        index: "index.html",
        serveStaticOptions: {
          extensions: ['html']
        },
        middleware: [
          require('webpack-dev-middleware')(compiler, {
            stats: 'errors-only',
            publicPath: webpackConfig.output.publicPath
          }),
          require('webpack-hot-middleware')(compiler)
        ]
      };

      return plugins.browserSync.init({
        server : server,
        port   : (plugins.util.env.port || 4000),
      });
    });

};

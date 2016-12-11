/**
 * Live reload server.
 */
module.exports = function(gulp, plugins) {

    gulp.task('serve:watch', function() {
      // Compile SCSS files
      gulp.watch('src/scss/**/*.scss', ['scss']);
      // Compile HTML files
      gulp.watch('src/html/*.html', ['html']);

      gulp.watch([
        'public/js/*.js'
      ]).on('change', plugins.browserSync.reload);
    });

    gulp.task('serve:start', function() {
      return plugins.browserSync.init({
        server : {
          baseDir: plugins.util.env.root || 'public',
          index: "index.html",
          serveStaticOptions: {
            extensions: ['html']
          }
        },
        port   : (plugins.util.env.port || 4000),
      });
    });

};

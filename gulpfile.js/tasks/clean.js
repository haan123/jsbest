/**
 * Tasks for cleaning up.
 */

module.exports = function(gulp, plugins) {
  gulp.task('clean', function() {
    return plugins.del(['public']);
  });
};

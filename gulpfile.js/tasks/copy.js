/**
 * Copy files to /public folder
 */

const merge = require('merge-stream');

module.exports = function(gulp, plugins) {
  return function() {
    return merge.apply(merge, [
      gulp.src([
        'src/lib/benchmark/benchmark.js',
        'src/lib/platform.js/platform.js'
      ])
      .pipe(plugins.if(!plugins.util.env.dev, plugins.uglify()))
      .pipe(gulp.dest('public/js')),

      gulp.src([
        'src/static/*'
      ])
      .pipe(gulp.dest('public'))
    ]);
  }
};

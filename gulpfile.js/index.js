const gulp    = require('gulp');
const pkg     = require('../package.json');
const plugins = require('gulp-load-plugins')();
const dir = require('require-dir')('./tasks', { recurse: true });

plugins.del         = require('del');
plugins.browserSync = require('browser-sync').create();
plugins.webpack = require('webpack');


Object.keys(dir).forEach(function(name) {
  let task = dir[name](gulp, plugins, pkg);
  // It has several tasks
  if (typeof task === 'function') {
    gulp.task(name, task);
  }
});


gulp.task('release:after', function() {
    return gulp.src('./release')
    .pipe(plugins.shell([
        'cd ./release && zip -r ../release/webapp.zip ./laverna',
    ]));
});

/**
 * Unit tests.
 */
gulp.task('test', ['mocha']);

/**
 * Build the app.
 * ``gulp build --dev`` to build without minifying.
 */
gulp.task('build', plugins.sequence(
    'test',
    'clean:dist',
    ['less'],
    ['copy', 'require', 'htmlmin', 'cssmin'],
    'htmlManifest'
));

/**
 * Prepare the release files.
 */
gulp.task('release', plugins.sequence(
    'build',
    'clean:release',
    ['copyDist', 'copyRelease'],
    'npm:install',
    'release:after'
));

/**
 * Gulp server.
 * ``gulp --root dist`` to serve dist folder.
 */
gulp.task('default', plugins.sequence(
    ['scss'],
    ['serve:start', 'serve:watch']
));

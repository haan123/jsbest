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

/**
 * Build the app.
 * ``gulp build --dev`` to build without minifying.
 */
gulp.task('build', plugins.sequence(
    'clean',
    ['scss', 'html'],
    // Bundle js files and create rev-manifest.json for revision
    ['webpack'],
    ['copy']
));

/**
 * Package production files
 */
gulp.task('production', plugins.sequence(
    ['build'],
    // Make revision from rev-manifest.json
    ['rev:css', 'rev:html']
));


/**
 * Gulp server.
 * ``gulp --root dist`` to serve dist folder.
 */
gulp.task('default', plugins.sequence(
    'clean',
    ['scss', 'html', 'copy'],
    ['serve:start', 'serve:watch']
));

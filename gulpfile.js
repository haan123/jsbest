/**
 * Common Tasks
 *
 * gulp watch - watch files and compile/reload/inject when changes are detected
 * gulp watch --styleguide - same as above, but builds styleguide as well
 * gulp - once-off build of all assets
 * gulp --styleguide - once-off build of all assets including styleguide
 * gulp styles - compile styles
 * gulp styles:watch - watch styles for changes and compile
 * gulp critical - generates critical css for pages specified in gulpfile.js
 * gulp scripts - compile JS
 * gulp scripts:watch - watch JS for changes and compile
 * gulp images - optimise images in /src/images and move to /assets/images
 * gulp wiredep - inject Bower dependencies
 * gulp build-styleguide - build the styleguide with KSS Node
 */

var gulp = require('gulp'),
    argv = require('yargs').argv,
    gulpif = require('gulp-if'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    gutil = require('gulp-util'),
    browserSync = require('browser-sync').create(),
    run = require('gulp-run'),
    notify = require('gulp-notify'),
    fs = require('fs'),
    path = require('path'),
    __basedir = './',
    imagemin = require('gulp-imagemin'),
    sourcemaps  = require('gulp-sourcemaps'),
    webpackConfig = require('./webpack.multi.config.js'),
    webpack = require('webpack');

var webpackWatchTask = function(callback) {
  var initialCompile = false;

  webpack(webpackConfig('development')).watch(200, function(err, stats) {
    browserSync.reload();
    if( err ) console.log(err);
    // On the initial compile, let gulp know the task is done
    if(!initialCompile) {
      initialCompile = true;
      callback();
    }
  });
};

gulp.task('webpack:watch', webpackWatchTask);

// tasks for when we run `gulp`
var defaultTaskList = ['styles', 'scripts'];
// tasks for when we run `gulp watch`
var watchTaskList = ['styles:watch', 'webpack:watch', 'html:watch', 'browser-sync'];

/**
 * A once-off, build everything task
 * @param  {string} 'default'  task name
 * @param  {Array}             list of tasks to run
 */
gulp.task('default', defaultTaskList);

// Change the proxy property to suit your domain
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
        index: "index.html"
    },
    serveStatic: ['./assets']
  });
});

/**
 * Optimise images in /src/images directory and output into /assets/images
 * @param  {string} 'images'  task name
 * @param  {function}
 */
gulp.task('images', function() {
  return gulp.src('src/images/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('assets/images'));
});

/**
 * Watch files for changes, and boot up browser-sync
 * @param  {string} 'watch'          task name
 * @param  {Array}                   list of tasks to run
 * @param  {function}
 */
gulp.task('watch', watchTaskList, function() {
  // these are our template files
  // when our JS is compiled, reload the browser
  gulp.watch('./assets/scripts/**/*.js').on('change', browserSync.reload);
});

/**
 * Handle errors
 * @see https://gist.github.com/wesbos/52b8fe7e972356e85b43
 * @return {void}
 */
function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

/**
 * Compile styles
 * @param  {string} 'styles'
 * @param  {function} callback for the task
 */
gulp.task('styles', function() {
  return gulp.src('./src/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', handleErrors))
    .pipe(autoprefixer({
        browsers: ['last 3 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(notify({title: 'Styles Compiled!', message: 'Good hustle', icon: './src/icon.png'}))
    .pipe(gulp.dest('./assets/css/'))
    .pipe(browserSync.stream());
});

/**
 * Watch styles and run the 'styles' task on change
 * @param  {string} 'styles:watch'
 * @param  {function} callback
 */
gulp.task('styles:watch', function() {
  gulp.watch('src/scss/**/*.scss', ['styles']);
});

/**
 * Watch html
 */
gulp.task('html:watch', function() {
  gulp.watch('./index.html', browserSync.reload);
});

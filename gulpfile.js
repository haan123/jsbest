let gulp = require('gulp');
let gulpif = require('gulp-if');
let sass = require('gulp-sass');
let autoprefixer = require('gulp-autoprefixer');
let gutil = require('gulp-util');
let browserSync = require('browser-sync').create();
let run = require('gulp-run');
let notify = require('gulp-notify');
let fs = require('fs');
let path = require('path');
let imagemin = require('gulp-imagemin');
let sourcemaps  = require('gulp-sourcemaps');
let webpackConfig = require('./webpack.multi.config.js');
let cssmin = require('gulp-cssmin');
let rename = require('gulp-rename');
let webpack = require('webpack');
let gulpSequence = require('gulp-sequence');
let del = require('del');
let rev = require('gulp-rev');
let revReplace = require('gulp-rev-replace');
let htmlmin = require('gulp-htmlmin');


let env = process.env.NODE_ENV == 'production';

var webpackWatchTask = function(callback) {
  var initialCompile = false;

  webpack(webpackConfig('development')).watch(200, function(err, stats) {
    browserSync.reload();
    var statColor = stats.compilation.warnings.length < 1 ? 'green' : 'yellow';

    if( err ) {
      stats.compilation.errors.forEach(handleErrors);
    } else {
      gutil.log(gutil.colors[statColor](stats));
      gutil.log('Compiled with', gutil.colors.cyan('webpack'), 'in', gutil.colors.magenta(stats.endTime - stats.startTime));
    }

    // On the initial compile, let gulp know the task is done
    if(!initialCompile) {
      initialCompile = true;
      callback();
    }
  });
};

gulp.task('webpack:watch', webpackWatchTask);

// tasks for when we run `gulp`
var defaultTaskList = ['styles', 'static', 'copy-js', 'html', 'watch'];
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
      index: "./public/index.html"
    },
    serveStatic: ['./public']
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

gulp.task('static', function() {
  return gulp.src('src/static/*')
    .pipe(gulp.dest('./public'));
});

gulp.task('copy-js', function() {
  return gulp.src(['./src/lib/benchmark/benchmark.js', './src/lib/platform.js/platform.js'])
          .pipe(gulp.dest('./public/js'));
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
  gulp.watch('./public/js/*.js').on('change', browserSync.reload);
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
    .pipe(gulpif(process.env.NODE_ENV != 'production', sourcemaps.write()))
    .pipe(notify({title: 'Styles Compiled!', message: 'Good hustle', icon: './src/icon.png'}))
    .pipe(gulpif(process.env.NODE_ENV == 'production', cssmin()))
    .pipe(gulp.dest('./public/css/'))
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
  gulp.watch('./src/html/index.html', ['html']);
});


gulp.task('clean', function (cb) {
  del(['./public']).then(function (paths) {
    cb();
  });
});

// Production
//
gulp.task('production', function(cb) {
  global.production = true;
  gulpSequence('clean', 'styles', 'html', 'webpack:production', 'rev-css', 'rev-html', cb);
});


gulp.task('webpack:production', function(callback) {
  webpack(webpackConfig('production'), function(err, stats) {
    var statColor = stats.compilation.warnings.length < 1 ? 'green' : 'yellow';

    if( err ) {
      stats.compilation.errors.forEach(handleErrors);
    } else {
      gutil.log(gutil.colors[statColor](stats));
      gutil.log('Compiled with', gutil.colors.cyan('webpack'), 'in', gutil.colors.magenta(stats.endTime - stats.startTime));
    }

    callback();
  });
});


gulp.task('html', () => {
  return gulp.src('./src/html/**/*.html')
    .pipe(gulpif(process.env.NODE_ENV == 'production', htmlmin({
      "collapseWhitespace": true
    })))
    .pipe(gulp.dest('./public'))
    .pipe(browserSync.stream());
});

gulp.task('rev-css', function(){
  return gulp.src('./public/**/*.css')
    .pipe(rev())
    .pipe(gulp.dest('./public'))
    // .pipe(revNapkin({verbose: false}))
    .pipe(rev.manifest('./public/rev-manifest.json', {merge: true}))
    .pipe(gulp.dest(''));
});

// Update asset references in HTML
gulp.task('rev-html', function(){
  return gulp.src('./public/**/*.html')
    .pipe(revReplace({
      manifest: gulp.src('./public/rev-manifest.json')
    }))
    .pipe(gulp.dest('./public'));
});

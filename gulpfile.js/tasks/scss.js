/**
 * Compile SCSS files.
 */
module.exports = function(gulp, plugins) {

    return function() {
      return gulp.src('src/scss/main.scss')
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass().on('error', function() {
          plugins.notify.onError({
            title: 'Sass Error',
            message: '<%= error.message %>'
          }).apply(this, arguments);
          this.emit('end'); // Keep gulp from hanging on this task
        }))
        .pipe(plugins.autoprefixer({
            browsers: ['last 3 versions']
        }))
        .pipe(plugins.util.env.dev ? plugins.sourcemaps.write() : plugins.cssmin())
        .pipe(gulp.dest('public/css/'))
        .pipe(plugins.browserSync.stream());
    };
};

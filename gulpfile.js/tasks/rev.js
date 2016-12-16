module.exports = function(gulp, plugins) {
  // Rev CSS files
  gulp.task('rev:css', function(){
    return gulp.src('public/css/*.css')
      .pipe(plugins.rev())
      .pipe(gulp.dest('public'))
      .pipe(plugins.rev.manifest('public/rev-manifest.json', {merge: true}))
      .pipe(gulp.dest('public'));
  });

  // Update asset references in HTML
  gulp.task('rev:html', function(){
    return gulp.src('public/*.html')
      .pipe(plugins['rev-replace']({
        manifest: gulp.src('public/rev-manifest.json')
      }))
      .pipe(gulp.dest('public'));
  });
};

/**
 * Copy HTML files and inject template's variables
 */

const through = require('through2');
const hogan = require('hogan.js');

let render = function(data) {
    var templates = {};

    var bufferContents = function(file, enc, cb) {
      if (file.isNull()) return cb(null, file);

      // customized delimiter used for production only
      let compiled = hogan.compile(['{{={{{ }}}=}}', file.contents.toString('utf8')].join(''));

      file.contents = new Buffer(compiled.render(data));

      cb(null, file);
    };

    return through.obj(bufferContents);
};

module.exports = function(gulp, plugins) {
  return function() {
    let config = {};

    if( !plugins.util.env.dev ) {
      config = Object.assign({}, config, {
        root_path: '/jsbest'
      });
    }

    return gulp.src('src/html/**/*.html')
      // inject template's variables in html
      .pipe(render(config))
      .pipe(plugins.if(!plugins.util.env.dev, plugins.htmlmin({
        collapseWhitespace: true
      })))
      .pipe(gulp.dest('public'))
      .pipe(plugins.browserSync.stream());
  }
};

var gulp = require('gulp');
var pkg = require('./package.json');
var header = require('gulp-header');
var rename = require('gulp-rename');
var del = require('del');
var pump = require('pump');
var runSequence = require('run-sequence');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var copy = require('gulp-copy');
var eslint = require('gulp-eslint');
var jest = require('gulp-jest').default;

var banner = [
        '/**\n',
        '* <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n',
        '* <%= pkg.description %>\n',
        '* <%= pkg.homepage %>\n',
        '*\n',
        '* =LICENSE=\n',
        '* <%= pkg.license.description %>\n',
        '* <%= pkg.license.url %>\n',
        '*\n',
        '* <%= pkg.license.copyright %>\n',
        '**/\n\n'
].join();

gulp.task('clean', function () {
  del.sync(['build/**/*.js', 'dist/**/*.js']);
});

gulp.task('babel', function () {
  return gulp.src('src/es6/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('build/js/'));
});

gulp.task('concat', function () {
  return gulp
    .src([
      'node_modules/babel-polyfill/dist/polyfill.js',
      'node_modules/cross-storage/dist/client.js',
      'build/js/**/*.js'
    ])
    .pipe(concat('emojidex-client.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('uglify', function (cb) {
  pump([
      gulp.src('dist/js/emojidex-client.js'),
      rename('emojidex-client.min.js'),
      uglify(),
      gulp.dest('dist/js/')
    ],
    cb
  );
});

gulp.task('banner', function () {
  return gulp
    .src('dist/js/*.js')
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('copy', function () {
  return gulp
    .src('src/html/hub.html')
    .pipe(gulp.dest('build'));
});

// gulp.task('jasmine', function () {
//   return gulp
//     .src('dist/js/emojidex-client.js')
//     .pipe(
//       jasmine({config: require('./spec/support/jasmine.json')})
//     );
// });
//
// gulp.task('jasmineBrowser', function() {
//   return gulp.src(['src/**/*.js', 'spec/**/*.spec.js'])
//     .pipe(jasmineBrowser.specRunner())
//     .pipe(jasmineBrowser.server({port: 8888}));
// });

gulp.task('jest', () => {
  return gulp.src('spec').pipe(jest({
    config: {
      "transformIgnorePatterns": [
        "<rootDir>/dist/", "<rootDir>/node_modules/"
      ],
      "automock": false
    }
  }))
});

gulp.task('lint', () => {
  return gulp.src(['src/es6/**/*.js','!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function () {
  gulp.watch('src/es6/**/*.js', [ /* dependencies */ ]);
});

gulp.task('default', function (cb) {
  runSequence("clean", ["copy", "babel"], "concat", "uglify", "banner", cb);
});

gulp.task('spec', ["default", "lint", "jest"]);

gulp.task('dev', ["default", "watch"]);

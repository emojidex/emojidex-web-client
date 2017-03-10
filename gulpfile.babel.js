import gulp from 'gulp';
import pkg from './package.json';
import header from 'gulp-header';
import rename from 'gulp-rename';
import del from 'del';
import pump from 'pump';
import runSequence from 'run-sequence';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import copy from 'gulp-copy';
import eslint from 'gulp-eslint';
import jasmine from 'gulp-jasmine-browser';
import webpack from 'webpack-stream';

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

gulp.task('webpack', function () {
  return gulp.src(['src/es6/entry.js'])
    .pipe(webpack({
      output: { filename: 'emojidex-client.js' },
      module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          }
        ]
      }
    }))
    .pipe(gulp.dest('dist/js/'));
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

gulp.task('jasmine', () => {
  return gulp.src([
    'dist/js/emojidex-client.js',
    'spec/client.spec.js'
    // 'spec/**/*.spec.js'
  ])
  // .pipe(babel())
  // .pipe(gulp.dest('build/spec'))
  // .pipe(webpack({watch: true, output: {filename: 'spec.js'}}))
  .pipe(jasmine.specRunner())
  .pipe(jasmine.server());
});

gulp.task('lint', () => {
  return gulp.src(['src/es6/**/*.js','!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function () {
  gulp.watch('src/es6/**/*.js', ['onWatch']);
  gulp.watch('spec/**/*.js', ['onWatch']);
});

gulp.task('default', function (cb) {
  runSequence("clean", ["copy", "webpack"], "uglify", "banner", cb);
});

gulp.task('onWatch', function (cb) {
  runSequence(["copy", "webpack"], "uglify", "banner", cb);
});

// gulp.task('spec', ["default", "lint", "jest"]);
gulp.task('spec', function (cb) {
  runSequence("default", ["jasmine", "watch"], cb/*, "lint"*/);
});

gulp.task('dev', function (cb) {
  runSequence("default", "watch", cb);
});

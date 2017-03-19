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
import watch from 'gulp-watch';
import fs from 'fs';

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
  let webpack_p = require('webpack-stream').webpack
  return gulp.src(['src/es6/client.js'])
    .pipe(webpack({
      output: {
        filename: 'emojidex-client.js',
        library: 'EmojidexClient'
      },
      module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          }
        ]
      },
      plugins: [
        new webpack_p.ProvidePlugin({
          $: 'jquery',
          'window.$': 'jquery'
        })
      ]
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

gulp.task('env', () => {
  fs.stat('.env', (err, stat) => {
    if (err == null) {
      return gulp.src('.env')
        .pipe(rename('authinfo.js'))
        .pipe(gulp.dest('tmp'));
    }
  });
});

gulp.task('jasmine', () => {
  let testFiles = [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/cross-storage/lib/client.js',
    'dist/js/emojidex-client.js',
    'spec/helpers/*.js',
    'tmp/authinfo.js',
    'spec/**/*.spec.js'
  ];
  return gulp.src(testFiles)
    .pipe(watch(testFiles))
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

// TODO: lint
gulp.task('spec', function (cb) {
  runSequence("default", "env", "jasmine", cb/*, "lint"*/);
});

gulp.task('dev', function (cb) {
  runSequence("default", "watch", cb);
});

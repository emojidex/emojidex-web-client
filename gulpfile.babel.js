import gulp from 'gulp';
import pkg from './package.json';
import header from 'gulp-header';
import del from 'del';
import runSequence from 'run-sequence';
import eslint from 'gulp-eslint';
import * as jasmineBrowser from 'gulp-jasmine-browser';
import watch from 'gulp-watch';
import fs from 'fs-extra';

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
  del.sync(['dist/**/*.js']);
});

gulp.task('banner', function () {
  return gulp
    .src('dist/js/*.js')
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('env', () => {
  fs.stat('.env', (err, stat) => {
    if (err === null) {
      const dotenv = require('dotenv')
      const envConfig = dotenv.parse(fs.readFileSync('.env'))
      for (var k in envConfig) {
        process.env[k] = envConfig[k]
      }
      let output = `
        let user_info = {
          auth_user: '${process.env.USERNAME}',
          email: '${process.env.EMAIL}',
          password: '${process.env.PASSWORD}',
          auth_token: '${process.env.AUTH_TOKEN}'
        };
        let premium_user_info = {
          auth_user: '${process.env.USERNAME}',
          auth_token: '${process.env.AUTH_TOKEN}'
        };
      `;
      fs.ensureFileSync('tmp/authinfo.js');
      fs.writeFileSync('tmp/authinfo.js', output);
    }
  });
});

gulp.task('jasmineBrowser', () => {
  let testFiles = [
    'node_modules/axios/dist/axios.js',
    'node_modules/cross-storage/lib/client.js',
    'dist/js/emojidex-client.js',
    'spec/helpers/*.js',
    'tmp/authinfo.js',
    'spec/**/*.spec.js'
  ];
  return gulp.src(testFiles)
    .pipe(watch(testFiles))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server());
});

// TODO: enable in tasks
gulp.task('lint', () => {
  return gulp.src(['src/es6/**/*.js','!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('default', function (cb) {
  runSequence('banner', cb);
});

// TODO: lint
gulp.task('spec', function (cb) {
  runSequence('env', 'jasmineBrowser', cb/*, "lint"*/);
});

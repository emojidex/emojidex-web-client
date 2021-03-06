import gulp from 'gulp';
import pkg from './package.json';
import header from 'gulp-header';
import del from 'del';
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

gulp.task('clean', function (done) {
  del.sync(['dist/**/*.js']);
  done();
});

gulp.task('banner', function () {
  return gulp
    .src('dist/js/*.js')
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('env', (done) => {
  fs.stat('.env', (err, stat) => {
    if (err === null) {
      const dotenv = require('dotenv')
      const envConfig = dotenv.parse(fs.readFileSync('.env'))
      for (var k in envConfig) {
        process.env[k] = envConfig[k]
      }
      let output = `
        let userInfo = {
          auth_user: '${process.env.USERNAME}',
          email: '${process.env.EMAIL}',
          password: '${process.env.PASSWORD}',
          auth_token: '${process.env.AUTH_TOKEN}'
        };
        let premiumUserInfo = {
          auth_user: '${process.env.USERNAME}',
          auth_token: '${process.env.AUTH_TOKEN}'
        };
      `;
      fs.ensureFileSync('tmp/authinfo.js');
      fs.writeFileSync('tmp/authinfo.js', output);
    }
  });
  done()
});

gulp.task('jasmineBrowser', () => {
  let testFiles = [
    'node_modules/axios/dist/axios.js',
    'node_modules/cross-storage/lib/client.js',
    'dist/js/emojidex-client.js',
    'tmp/authinfo.js',
    'spec/helpers/*.js',
    // 'spec/data.spec.js' // for simple test
    'spec/**/*.spec.js'
  ];
  return gulp.src(testFiles)
    .pipe(watch(testFiles))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server());
});

gulp.task('default',
  gulp.series('banner')
);

gulp.task('spec',
  gulp.series('env', 'jasmineBrowser')
);

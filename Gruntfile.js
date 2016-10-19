module.exports = function(grunt) {
  let path = require('path');

  // Check for .env file to generate auth info for advanced specs
  if (grunt.file.exists('.env')) {
    grunt.log.writeln("*Found .env file; incorporating user auth data into specs.*");
    grunt.log.writeln("NOTE: if your user is not Premium with R-18 enabled some specs will fail.");
    let dotenv = require('dotenv');
    dotenv.config();

    output = `
      this.user_info = {
        auth_user: '${process.env.USERNAME}',
        email: '${process.env.EMAIL}',
        password: '${process.env.PASSWORD}',
        auth_token: '${process.env.AUTH_TOKEN}'
      };

      this.premium_user_info = {
        auth_user: '${process.env.USERNAME}',
        auth_token: '${process.env.AUTH_TOKEN}'
      };
    `;

    grunt.file.write('tmp/authinfo.js', output);
  } else { // .env file wasn't found
    grunt.log.writeln("*.env file not found; only some specs will run.*");
    grunt.log.writeln("Check the '.env' secion in README.md for details on how to set .env");
    grunt.file.write('tmp/authinfo.js', "");
  }

  // Grunt task configurations
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner:
        '/*\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
        ' * <%= pkg.description %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * =LICENSE=\n' +
        ' * <%= pkg.license.description %>\n' +
        ' * <%= pkg.license.url %>\n' +
        ' *\n' +
        ' * <%= pkg.license.copyright %>\n' +
        ' *\n' +
        ' *\n' +
        ' * Includes:\n' +
        ' * --------------------------------'
    },

    //=========================================================================
    // Grunt configurations for individual tasks
    //=========================================================================

    // Clean out old files / temporary files / build partials
    clean: {
      spec: ['build/spec/*.js']
    },

    // SLIM file compilation options
    slim: {
      options: {
        pretty: true
      },
      dsit: {
        files: [{
          expand: true,
          cwd: 'src/slim/',
          src: '*.slim',
          dest: 'build/',
          ext: '.html'
        }]
      }
    },

    // Babel configuration to convert es6 to es5~ish JS
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/es6',
          src: ['**/*.js'],
          dest: 'build/js/',
          ext: '.js'
        }]
      }
    },

    // Concat files together into one script
    concat: {
      javascript: {
        options: {
          stripBanners: true
        },
        src: [
          'node_modules/babel-polyfill/dist/polyfill.min.js',
          'node_modules/cross-storage/dist/client.min.js',
          'build/js/**/*.js'
        ],
        dest: 'dist/js/emojidex-client.js'
      }
    },

    // Minify our conglomorate script after concatination
    uglify: {
      client: {
        // options:
        //   manglet: true
        src: ['dist/js/emojidex-client.js'],
        dest: 'dist/js/emojidex-client.min.js'
      }
    },

    // Setup Jasmine spec coverage
    jasmine: {
      client: {
        src: ['dist/js/emojidex-client.js'],
        options: {
          specs: [
            'spec/data.js',
            'spec/util.js',
            'spec/client.js',
            'spec/categories.js',
            'spec/emoji.js',
            'spec/indexes.js',
            'spec/search.js',
            'spec/user.js' // ,
            // 'spec/*.js'
          ],
          helpers:[
            'spec/helpers/method.js',
            'spec/helpers/data.js',
            'tmp/authinfo.js'
          ],
          vendor:[
            'node_modules/jquery/dist/jquery.min.js'
          ],
          keepRunner: true,
          outfile: 'build/_SpecRunner.html'
        }
      }
    },

    //-------------------------------------------------------------------------
    // Grunt configurations specific to the dev runner tasks
    //-------------------------------------------------------------------------

    // Local dev client for live testing
    connect: {
      client: {}//,
//      hub: {
//        options: {
//          port: 8001
//        }
//      }
    },

    // Auto re-build watcher configuration
    watch: {
      scripts: {
        files: ['src/es6/**/*.js', 'spec/**/*.js'],
        tasks: [
          'babel',
          'concat',
          'uglify',
          'jasmine'
        ],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-slim');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['clean', 'slim', 'babel', 'concat', 'uglify']);
  grunt.registerTask('spec', ['default', 'jasmine:client:build', 'jasmine']);
  grunt.registerTask('dev', ['default', 'jasmine:client:build', 'connect', 'watch']);
}

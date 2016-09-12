module.exports = function(grunt) {
  let path = require('path');

  // Check for .env file to generate auth info for advanced specs
  if (grunt.file.exists('.env')) {
    grunt.log.writeln("*Found .env file; incorporating user auth data into specs.*");
    grunt.log.writeln("NOTE: if your user is not Premium with R-18 enabled some specs will fail.");
    let dotenv = require('dotenv');
    dotenv.config();

    let output = this.user_info = {
      auth_user: '${process.env.USERNAME}',
      email: '${process.env.EMAIL}',
      password: '${process.env.PASSWORD}',
      auth_token: '${process.env.AUTH_TOKEN}'
    };

    this.premium_user_info = {
      auth_user: '${process.env.USERNAME}',
      auth_token: '${process.env.AUTH_TOKEN}'
    };


    grunt.file.write('tmp/authinfo.js', output);
  } else { // .env file wasn't found
    grunt.log.writeln("*.env file not found; only some specs will run.*");
    grunt.log.writeln("Check the '.env' secion in README.md for details on how to set .env");
    grunt.file.write('tmp/authinfo.js', "");
  }

  // ?
  let getDefineUsePattern = function(filepath, define_list) {
    let iterable = Object.keys(define_list);
    for (let i = 0; i < iterable.length; i++) {
      let define_name = iterable[i];
      let path_patterns = define_list[define_name].pattern;
      if (!Array.isArray(path_patterns)) { path_patterns = [path_patterns]; }
      for (let j = 0; j < path_patterns.length; j++) {
        let path_pattern = path_patterns[j];
        if (grunt.file.minimatch(filepath, path_pattern)) {
          return define_list[define_name];
          break;
        }
      }
    }
  };

  let setGruntConfig_getTask = function(define) {
    if (define.config != null) {
      if (!Array.isArray(define.config)) { define.config = [define.config]; }
      for (let i = 0; i < define.config.length; i++) {
        let config = define.config[i];
        grunt.config(config.prop, config.value);
      }
    }
    return define.task;
  };

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
        files: {
          'build/js/emojidex-client.js': ['src/es6/**/*.js']
        }
      }
    },

    // Coffee file compilation options
    coffee: {
      client: {
        options: {
          join: true
        },
        files: {
          'src/compiled_js/emojidex-client.js': ['src/coffee/**/*.coffee']
        }
      },
      spec: {
        options: {
          bare: true
        },
        expand: true,
        cwd: 'spec/',
        src: ['**/*.coffee'],
        dest: 'build/spec/',
        ext: '.js'
      }
    },

    // Concat files together into one script
    concat: {
      compiled_js: {
        options: {
          stripBanners: true
        },
        src: [
          'node_modules/cross-storage/dist/client.min.js',
          'src/compiled_js/**/*.js'
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
      coverage: {
        src: [
          'dist/js/emojidex-client.js'
        ],
        options: {
          specs: 'build/spec/*.js',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'build/spec/coverage/coverage.json',
            report: [
              {
                type: 'html',
                options: { dir: 'build/spec/coverage/html' }
              },
              {
                type: 'cobertura',
                options: { dir: 'build/spec/coverage/cobertura' }
              },
              { type: 'text-summary' }
            ]
          }
        }
      },
      options: {
        keepRunner: true,
        outfile: 'build/_SpecRunner.html',
        vendor:[
          'node_modules/jquery/dist/jquery.min.js',
          'node_modules/promise-polyfill/Promise.min.js'
        ],
        helpers:[
          'build/spec/helpers/method.js',
          'build/spec/helpers/data.js',
          'tmp/authinfo.js'
        ]
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
    esteWatch: {
      options: {
        dirs: [
          'src/coffee/**/',
          'spec/**/'
        ],
        livereload: {
          enabled: true,
          port: 35729,
          extensions: ['coffee']
        }
      },

      ['coffee'](filepath) {
        let defaults = {
          coffee: {
            prop: ['coffee', 'esteWatch']
          },

          jasmine: {
            prop: ['jasmine', 'esteWatch'],
            value: {
              src: ['dist/js/emojidex-client.js']
            }
          }
        };

        let spec_file = "";
        if (path.basename(filepath, '.coffee')[0] === "_") {
          let divided_path = path.dirname(filepath).split('/');
          spec_file = divided_path[divided_path.length - 1];
        } else {
          spec_file = path.basename(filepath, '.coffee');
        }

        if (spec_file === 'data') {
          spec_file = '1_data';
        }

        let define_list = {
          client: {
            pattern: "src/coffee/**/*",
            config: {
              prop: defaults.jasmine.prop,
              value: {
                src: defaults.jasmine.value.src,
                options: {
                  specs: [
                    `build/spec/${spec_file}.js`
                  ]
                }
              }
            },
            task: [
              'coffee:client',
              'concat',
              'uglify',
              defaults.jasmine.prop.join(':') + ':build'
            ]
          },

          spec: {
            pattern: 'spec/**/*',
            config: [
              {
                prop: defaults.coffee.prop,
                value: {
                  options: {
                    bare: true
                  },
                  expand: true,
                  src: filepath,
                  dest: 'build/',
                  ext: '.js'
                }
              },
              {
                prop: defaults.jasmine.prop,
                value: {
                  src: defaults.jasmine.value.src,
                  options: {
                    specs: `build/${path.dirname(filepath)}/${path.basename(filepath, '.coffee')}.js`,
                    display: "full",
                    summary: true
                  }
                }
              }
            ],
            task: [
              defaults.coffee.prop.join(':'),
              defaults.jasmine.prop.join(':') + ':build'
            ]
          }
        };

        return setGruntConfig_getTask(getDefineUsePattern(filepath, define_list));
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-slim');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-este-watch');

  grunt.registerTask('default', ['clean', 'slim', 'babel', 'coffee', 'concat', 'uglify', 'jasmine:coverage:build']);
  grunt.registerTask('dev', ['default', 'connect', 'esteWatch']);
}

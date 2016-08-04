module.exports = (grunt) ->
  path = require 'path'

  if grunt.file.exists('.env')
    grunt.log.writeln("*Found .env file; incorporating user auth data into specs.*")
    grunt.log.writeln("NOTE: if your user is not Premium with R-18 enabled some specs will fail.")
    dotenv = require 'dotenv'
    dotenv.config()

    output = """
      this.user_info = {
        auth_user: '#{process.env.USERNAME}',
        email: '#{process.env.EMAIL}',
        password: '#{process.env.PASSWORD}',
        auth_token: '#{process.env.AUTH_TOKEN}'
      };

      this.premium_user_info = {
        auth_user: '#{process.env.USERNAME}',
        auth_token: '#{process.env.AUTH_TOKEN}'
      };

    """

    grunt.file.write('tmp/authinfo.js', output)

  else
    grunt.log.writeln("*.env file not found; only some specs will run.*")
    grunt.log.writeln("Check the '.env' secion in README.md for details on how to set .env")
    grunt.file.write('tmp/authinfo.js', "")


  getDefineUsePattern = (filepath, define_list) ->
    for define_name in Object.keys define_list
      path_patterns = define_list[define_name].pattern
      path_patterns = [path_patterns] unless Array.isArray path_patterns
      for path_pattern in path_patterns
        if grunt.file.minimatch filepath, path_pattern
          return define_list[define_name]
          break

  setGruntConfig_getTask = (define) ->
    if define.config?
      define.config = [define.config] unless Array.isArray define.config
      for config in define.config
        grunt.config config.prop, config.value
    return define.task

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    meta:
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

    # grunt --------------------------------
    coffee:
      client:
        options:
          join: true
        files:
          'src/compiled_js/emojidex-client.js': ['src/coffee/**/*.coffee']
      spec:
        options:
          bare: true
        expand: true
        cwd: 'spec/'
        src: ['**/*.coffee']
        dest: 'build/spec/'
        ext: '.js'

    concat:
      compiled_js:
        options:
          stripBanners: true
        src: [
          'node_modules/cross-storage/dist/client.min.js'
          'src/compiled_js/**/*.js'
        ]
        dest: 'dist/js/emojidex-client.js'

    uglify:
      client:
        # options:
        #   manglet: true
        src: ['dist/js/emojidex-client.js']
        dest: 'dist/js/emojidex-client.min.js'

    clean:
      spec: ['build/spec/*.js']

    jasmine:
      coverage:
        src: [
          'dist/js/emojidex-client.js'
        ]
        options:
          specs: 'build/spec/*.js'
          template: require('grunt-template-jasmine-istanbul')
          templateOptions:
            coverage: 'build/spec/coverage/coverage.json'
            report: [
              {
                type: 'html'
                options: dir: 'build/spec/coverage/html'
              }
              {
                type: 'cobertura'
                options: dir: 'build/spec/coverage/cobertura'
              }
              { type: 'text-summary' }
            ]

      options:
        keepRunner: true
        outfile: 'build/_SpecRunner.html'
        vendor:[
          'node_modules/jquery/dist/jquery.min.js'
          'node_modules/promise-polyfill/Promise.min.js'
        ]
        helpers:[
          'build/spec/helpers/method.js'
          'build/spec/helpers/data.js'
          'tmp/authinfo.js'
        ]

    slim:
      options:
        pretty: true
      dsit:
        files: [
          expand: true
          cwd: 'src/slim/'
          src: '*.slim'
          dest: 'build/'
          ext: '.html'
        ]

    # grunt dev --------------------------------
    connect:
      client: {}
      hub:
        options:
          port: 8001
    esteWatch:
      options:
        dirs: [
          'src/coffee/**/'
          'spec/**/'
        ]
        livereload:
          enabled: true
          port: 35729,
          extensions: ['coffee']

      'coffee': (filepath) ->
        defaults =
          coffee:
            prop: ['coffee', 'esteWatch']

          jasmine:
            prop: ['jasmine', 'esteWatch']
            value:
              src: ['dist/js/emojidex-client.js']

        spec_file = ""
        if path.basename(filepath, '.coffee')[0] is "_"
          divided_path = path.dirname(filepath).split('/')
          spec_file = divided_path[divided_path.length - 1]
        else
          spec_file = path.basename(filepath, '.coffee')

        if spec_file is 'data'
          spec_file = '1_data'

        define_list =
          client:
            pattern: "src/coffee/**/*"
            config:
              prop: defaults.jasmine.prop
              value:
                src: defaults.jasmine.value.src
                options:
                  specs: [
                    "build/spec/#{spec_file}.js"
                  ]
            task: [
              'coffee:client'
              'concat'
              'uglify'
              defaults.jasmine.prop.join(':') + ':build'
            ]

          spec:
            pattern: 'spec/**/*'
            config: [
              {
                prop: defaults.coffee.prop
                value:
                  options:
                    bare: true
                  expand: true
                  src: filepath
                  dest: 'build/'
                  ext: '.js'
              }
              {
                prop: defaults.jasmine.prop
                value:
                  src: defaults.jasmine.value.src
                  options:
                    specs: "build/#{path.dirname filepath}/#{path.basename filepath, '.coffee'}.js"
                    display: "full"
                    summary: true
              }
            ]
            task: [
              defaults.coffee.prop.join(':')
              defaults.jasmine.prop.join(':') + ':build'
            ]

        setGruntConfig_getTask(getDefineUsePattern filepath, define_list)

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-este-watch'
  grunt.loadNpmTasks 'grunt-contrib-jasmine'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-slim'

  grunt.registerTask 'default', ['clean', 'slim', 'coffee', 'concat', 'uglify', 'jasmine:coverage:build']
  grunt.registerTask 'dev', ['default', 'connect', 'esteWatch']

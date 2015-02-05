module.exports = (grunt) ->
  grunt.getLicense = (licenses_json) ->
    licenses = grunt.file.readJSON licenses_json
    info = ''
    for license in licenses
      info += license.replace /[ \n\*]+(.+) +\n/gi , "\n * $1"
      info += '* --------------------------------'
    return info

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
        ' * <%= pkg.licenses.description %>\n' +
        ' * <%= pkg.licenses.url %>\n' +
        ' *\n' +
        ' * <%= pkg.licenses.copyright %>\n' +
        ' *\n' +
        ' *\n' +
        ' * Includes:\n' +
        ' * --------------------------------'

    # grunt --------------------------------
    save_license:
      dist:
        src: [
          'bower_components/jquery.storageapi/jquery.storageapi.js'
        ]
        dest: 'build/licenses.json'

    coffee:
      client:
        options:
          join: true
        files:
          'src/compiled_js/emojidex-client.js': ['src/coffee/**/*.coffee']
      spec:
        expand: true
        flatten: true
        cwd: 'spec/'
        src: ['*.coffee']
        dest: 'build/spec/'
        ext: '.js'

    concat:
      compiled_js:
        options:
          stripBanners: true
          banner: '<%= meta.banner %><%= grunt.getLicense("build/licenses.json") %>\n */\n'
        src: [
          'bower_components/jquery.storageapi/jquery.storageapi.js'
          'src/compiled_js/**/*.js'
        ]
        dest: 'dist/js/emojidex-client.js'

    uglify:
      client:
        options:
          manglet: true
          banner: '<%= meta.banner %><%= grunt.getLicense("build/licenses.json") %>\n */\n'
        src: ['dist/js/emojidex-client.js']
        dest: 'dist/js/emojidex-client.min.js'

    jasmine:
      all:
        src: [
          'dist/js/jquery.storageapi.min.js',
          'dist/js/emojidex-client.js'
        ]
        options:
          keepRunner: true
          outfile: 'build/_SpecRunner.html'
          specs: [
            'build/spec/*.js'
          ]
          vendor:[
            'https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js'
          ]

    # grunt dev --------------------------------
    connect:
      site: {}

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
            options:
              join: true
          jasmine:
            prop: ['jasmine', 'esteWatch']
            value:
              src: ['dist/js/*.min.js']


        spec_file = ""
        if path.basename(filepath, '.coffee')[0] is "_"
          divided_path = path.dirname(filepath).split('/')
          spec_file = divided_path[divided_path.length - 1]
        else
          spec_file = path.basename(filepath, '.coffee')

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
              "coffee:client"
              'concat'
              'uglify'
              defaults.jasmine.prop.join(':')
            ]

          spec:
            pattern: 'spec/**/*'
            config: [
              {
                prop: defaults.coffee.prop
                value:
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
                    specs: [
                      "build/#{path.dirname filepath}/#{path.basename filepath, '.coffee'}.js"
                    ]
              }
            ]
            task: [defaults.coffee.prop.join(':'), defaults.jasmine.prop.join(':')]

        setGruntConfig_getTask(getDefineUsePattern filepath, define_list)

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-este-watch'
  grunt.loadNpmTasks 'grunt-contrib-jasmine'
  grunt.loadNpmTasks 'grunt-license-saver'

  grunt.registerTask 'default', ['save_license', 'coffee', 'concat', 'uglify', 'jasmine']
  grunt.registerTask 'dev', ['connect', 'esteWatch']

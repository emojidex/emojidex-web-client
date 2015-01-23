module.exports = (grunt) ->
  grunt.initConfig

    # Import package manifest
    pkg: grunt.file.readJSON('package.json')

    # Banner definitions
    meta:
      banner:
        '/*\n' +
        ' *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
        ' *  <%= pkg.description %>\n' +
        ' *  <%= pkg.homepage %>\n' +
        ' *\n' +
        ' *  =LICENSE=\n' +
        ' *  <%= pkg.licenses.description %>\n' +
        ' *  <%= pkg.licenses.url %>\n' +
        ' *\n' +
        ' *  <%= pkg.licenses.copyright %>\n' +
        ' */\n'

    # CoffeeScript compilation
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

    # Concat definitions
    concat:
      compiled_js:
        options:
          stripBanners: true
          banner: '<%= meta.banner %>'
        src: [
          'src/compiled_js/**/*.js'
        ]
        dest: 'dist/js/emojidex-client.js'

    # Minify definitions
    uglify:
      emojidex:
        options:
          manglet: true
        src: ['dist/js/emojidex-client.js']
        dest: 'dist/js/emojidex-client.min.js'
      options:
        preserveComments: 'all'

    # copy definitions
    copy:
      img:
        expand: true,
        cwd: 'src/img/'
        src: '**/*'
        dest: 'dist/img/'
      lib:
        files: [
          {
            expand: true,
            cwd: 'bower_components/jquery.storageapi/'
            src: 'jquery.storageapi.min.js'
            dest: 'dist/js/'
          }
        ]

    # connect definitions
    connect:
      site: {}

    # watch definitions
    watch:
      coffee:
        files: ['src/coffee/**/*.coffee']
        tasks: ['coffee:client', 'concat:compiled_js', 'uglify:emojidex', 'jasmine']
      spec:
        files: ['spec/**/*.coffee']
        tasks: ['coffee:spec', 'jasmine']
      options:
        livereload: true

    # jasmine definitions
    jasmine:
      all:
        src: [
          'dist/js/*.min.js'
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

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-jasmine'

  grunt.registerTask 'default', ['coffee', 'concat:compiled_js', 'uglify', 'copy', 'jasmine']
  grunt.registerTask 'dev', ['connect', 'watch']

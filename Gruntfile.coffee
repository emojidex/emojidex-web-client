module.exports = (grunt) ->
  grunt.getLicense = (licenses_json) ->
    licenses = grunt.file.readJSON licenses_json
    remove_string = ['\n', ' ', '*']
    info = ''
    for license in licenses
      license = license.slice(1) until remove_string.indexOf(license.slice(0, 1)) is -1
      license = license.slice(0, -1) until remove_string.indexOf(license.slice(-1)) is -1
      info += '\n * '
      info += license
      info += '\n * --------------------------------'
    return info

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

    connect:
      site: {}

    watch:
      coffee:
        files: ['src/coffee/**/*.coffee']
        tasks: ['coffee:client', 'concat:compiled_js', 'uglify', 'jasmine']
      spec:
        files: ['spec/**/*.coffee']
        tasks: ['coffee:spec', 'jasmine']
      options:
        livereload: true

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

    save_license:
      dist:
        src: [
          'bower_components/jquery.storageapi/jquery.storageapi.js'
        ]
        dest: 'build/licenses.json'

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-jasmine'
  grunt.loadNpmTasks 'grunt-license-saver'

  grunt.registerTask 'default', ['save_license', 'coffee', 'concat:compiled_js', 'uglify', 'copy', 'jasmine']
  grunt.registerTask 'dev', ['connect', 'watch']

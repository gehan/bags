module.exports = (grunt) ->

    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

        watch:
            files: ['src/**.coffee', 'spec/coffeescripts/**.coffee']
            tasks: ['test']

        coffee:
            options:
                bare: true
            bags:
                expand: true
                cwd: 'src'
                src: ['**/*.coffee']
                dest: 'dist'
                ext: '.js'
            specs:
                expand: true
                cwd: 'spec/coffeescripts'
                src: ['**/*.coffee']
                dest: 'spec/javascripts'
                ext: '.js'

        shell:
            docs:
                command: 'node_modules/.bin/docco-husky src'
                options:
                    stdout: true

        jasmine:
            conversocial:
                src: []
                options:
                    specs: ["spec/javascripts/*.js"]
                    template : require('grunt-template-jasmine-curljs')
                    templateOptions:
                        curlConfig :
                            baseUrl: ''
            options:
                helpers : ['spec/javascripts/helpers/*.js']
                vendor: [
                    "vendor/curl-env.js",
                    "vendor/mootools-core-1.4.5.js",
                    "vendor/mootools-more-1.4.0.1.js",
                    "vendor/dust-full-0.3.0.min.js",
                ]

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-jasmine'
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-shell'

    grunt.registerTask 'default', ['coffee', 'shell:docs']
    grunt.registerTask 'test', ['coffee', 'jasmine', 'watch']

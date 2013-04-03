module.exports = (grunt) ->

    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

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

        jasmine:
            conversocial:
                src: []
                options:
                    specs: ["spec/javascripts/**/*.js"]
            options:
                helpers : ['specs/helpers/*.js']
                vendor: [
                    "vendor/q.min.js",
                    "vendor/curl-env.js",
                    "vendor/mootools-core-1.4.5.js",
                    "vendor/mootools-more-1.4.0.1.js",
                    "vendor/curl.js",
                    "vendor/behaviour/Element.Data.js",
                    "vendor/behaviour/Event.Mock.js",
                    "vendor/behaviour/BehaviorAPI.js",
                    "vendor/behaviour/Behavior.js",
                    "vendor/behaviour/Behavior.Startup.js",
                    "vendor/behaviour/Delegator.js",
                    "vendor/dust-full-0.3.0.min.js",
                ]

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-jasmine'

    grunt.registerTask 'default', ['coffee']
    grunt.registerTask 'test', ['coffee', 'jasmine']

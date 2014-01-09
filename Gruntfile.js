/*global module:false*/

var path = require('path');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        requirejs: {
            compile: {
                options: {
                    banner: '<%= banner %>',
                    baseUrl: 'lib/',
                    out: 'dist/<%= pkg.name %>.min.js',
                    name: 'ko.ninja',
                    preserveLicenseComments: false,
                    optimize: 'uglify2',
                    mainConfigFile: 'lib/build.js',
                    exclude: [
                        'underscore',
                        'knockout'
                    ]
                }
            },
            pretty: {
                options: {
                    banner: '<%= banner %>',
                    baseUrl: 'lib/',
                    out: 'dist/<%= pkg.name %>.js',
                    name: 'ko.ninja',
                    preserveLicenseComments: false,
                    optimize: 'none',
                    mainConfigFile: 'lib/build.js',
                    exclude: [
                        'underscore',
                        'knockout'
                    ]
                }
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: 'dist/<%= pkg.name %>.amd.min.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            options: {
                curly: false,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                expr: true,
                browser: true,
                globals: {
                    jQuery: true,
                    module: true,
                    test: true,
                    ok: true,
                    ko: true,
                    QUnit: true,
                    define: true,
                    require: true,
                    console: true,
                    equal: true,
                    asyncTest: true,
                    start: true
                }
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['lib/**/*.js', 'test/**/*.js']
            }
        },
        qunit: {
            all: {
                options: {
                    urls: [
                        'http://localhost:8001/qunit.html'
                    ]
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'qunit']
            }
        },
        express: {
            server: {
                options: {
                    hostname: 'localhost',
                    port: 8003,
                    server: path.resolve('./server'),
                    debug: false
                }
            }
        },
        connect: {
            test: {
                options: {
                    port: 8002,
                    base: 'test',
                    keepalive: true,
                    middleware: function(connect, options) {
                        return [
                            connect.static('bower_components'),
                            connect.static('lib'),
                            connect.static(options.base),
                            connect.directory(options.base)
                        ];
                    }
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Default task.
    grunt.registerTask('default', ['jshint', 'requirejs']);
    grunt.registerTask('test', ['connect:qunit', 'qunit']);
    grunt.registerTask('server', ['express', 'watch']);

};

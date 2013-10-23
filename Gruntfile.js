/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['lib/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
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
                    equal: true
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
        connect: {
            example: {
                options: {
                    port: 8000,
                    base: 'example'
                }
            },
            qunit: {
                options: {
                    port: 8001,
                    base: 'test',
                    middleware: function(connect, options) {
                        return [
                            connect.static('bower_components'),
                            connect.static('dist'),
                            connect.static(options.base),
                            connect.directory(options.base)
                        ];
                    }
                }
            },
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
            },
            server: {
                options: {
                    port: 8003,
                    base: 'examples',
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
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Default task.
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('test', ['connect:qunit', 'qunit']);

};
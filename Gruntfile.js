module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //    uglify: {
        //      options: {
        //        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        //      },
        //      build: {
        //        src: 'src/<%= pkg.name %>.js',
        //        dest: 'build/<%= pkg.name %>.min.js'
        //      }
        //    }

        clean: ["dist", '.tmp'],

        ngtemplates: {
            app: {
                cwd: 'src',
                src: 'partials/**.html',
                dest: '.tmp/templates.js',
                options: {
                    module: 'discGolfApp',
                    htmlmin: {
                        collapseBooleanAttributes:      true,
                        collapseWhitespace:             true,
                        removeAttributeQuotes:          true,
                        removeComments:                 true,
                        removeEmptyAttributes:          true,
                        removeRedundantAttributes:      true,
                        removeScriptTypeAttributes:     true,
                        removeStyleLinkTypeAttributes:  true
                    },
                    usemin: 'dist\\scripts.js'
                }
            }
        },

        useminPrepare: {
            html: 'src/index.html',
            options: {
                dest: 'dist'
            }
        },

        usemin:{
            html:['dist/index.html']
        },

        copy: {
            html: {
                src: 'src/index.html', 
                dest: 'dist/index.html'
            },
            img: {
                expand: true,
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['img/**'],
                        dest: 'dist/'
                    }
                ]
            },
            tomcat: {
                expand: true,
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['**'],
                        dest: 'C:/Program Files/Apache Software Foundation/Tomcat 7.0/webapps/test/'
                    }
                ]
            }
        },

        uglify: {
            options: {
                mangle: false,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
        },

        'gh-pages': {
            options: {
                base: 'dist'
            },
            src: ['**']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-gh-pages');

    grunt.registerTask('build',[
        'clean',
        'copy:html',
        'copy:img',
        'useminPrepare',
        'ngtemplates',
        'concat',
        'uglify',
        'cssmin',
        'usemin']);

    grunt.registerTask('default', ['build']);
    grunt.registerTask('buildAndDeploy', ['build', 'copy:tomcat']);
    grunt.registerTask('publish', ['build', 'gh-pages']);
};
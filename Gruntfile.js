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
            }
        },

        uglify: {
            options: {
                mangle: false,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default',[
        'clean',
        'copy:html',
        'useminPrepare',
        'ngtemplates',
        'concat',
        'uglify',
        'cssmin',
        'usemin']);
};
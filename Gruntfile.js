'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        watch: {
            components: {
                files: [
			        'Gruntfile.js',
			        'public/index.html',
			        'public/app.js',
			        'public/app.css'
		        ],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            }
        },

        jshint: {
            files: [
        		'public/*.js'
      		],
			options: {
				jshintrc: '.jshintrc'
			}
	    },

        bowerInstall: {
            target: {
                src: ['public/index.html']
            }
        }
    });
};
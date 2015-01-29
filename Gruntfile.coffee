module.exports = (grunt) ->
	grunt.initConfig
		pkg: grunt.file.readJSON("package.json")

		minified :
			files:
				src: 'js/*.js',
				dest: 'site/assets/js/'
			
			options :
				sourcemap: true,
				allinone: false

		sass:
			dist:
				options:
					outputStyle: "compressed"
				files:
					"site/assets/css/main.css": "sass/main.sass"

		watch:
			
			minified:
				files: "js/*.js"
				tasks: ["minified"]
				options:
					livereload: true
			css:
				files: "sass/*.sass"
				tasks: ["sass"]
				options:
					livereload: true

	grunt.loadNpmTasks "grunt-sass"
	grunt.loadNpmTasks "grunt-minified"
	grunt.loadNpmTasks "grunt-contrib-watch"
	grunt.registerTask "default", [
		"minified"
		"sass"
		"watch"
	]
	return
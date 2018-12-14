module.exports = {
	server: {
		root: './production/public/',
	},

	styles: {
		SRC: './src/sass/**/*.sass',
		DEST: './production/public/assets/css/',
	},

	pugTemplates: {
		SRC: './src/pug/**/*.pug',
		DEST: './production/public/'
	},

	js: {
		SRC: './src/js/**/*.js',
		DEST: './production/public/assets/js/'
	},

	image: {
		SRC: './src/images/**/*',
		DEST: './production/public/assets/images/'
	}
}
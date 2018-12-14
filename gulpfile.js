let appPaths = require('./src/config/gulp-config/paths.js')
	gulp = require('gulp'),
	//gulp = require('gulp4'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	plumber = require('gulp-plumber'),
	minifyJS = require('gulp-minify'),
	imagemin = require('gulp-imagemin'),
	concatJS = require('gulp-concat'),
	browserSync = require('browser-sync').create(),
	concatJSFiles = ['./src/js/main.js', './src/js/classes/FirestoreDatabase.js',
					'./src/js/classes/Layout.js', './src/js/classes/Navigation.js', './src/js/classes/BodyBgImage.js',
					'./src/js/classes/TableBgColor.js', './src/js/classes/CreateElement.js', './src/js/classes/PricingPlans.js'];


//SASS Compaling task
gulp.task('sass', function() {
	return gulp.src(appPaths.styles.SRC)
				.pipe(plumber())
				//.pipe(sass()) //Not Compressing output css file
				.pipe(sass({outputStyle: 'compressed'})) //Compressing output css file
				.pipe(gulp.dest(appPaths.styles.DEST))
				.pipe(browserSync.stream());
});


//Pug Compailing task
gulp.task('pug', function() {
	return gulp.src(appPaths.pugTemplates.SRC)
				.pipe(plumber())
				.pipe(pug())
				.pipe(gulp.dest(appPaths.pugTemplates.DEST))
				.pipe(browserSync.stream());
});


//Compress JS code
gulp.task('compress', function() {
	return gulp.src(concatJSFiles)
				.pipe(plumber())
				.pipe(concatJS('main.js'))
				.pipe(minifyJS())
				.pipe(gulp.dest(appPaths.js.DEST))
				.pipe(browserSync.stream());
});


//Compress Images
gulp.task('images', function() {
	return gulp.src(appPaths.image.SRC)
				.pipe(imagemin([
					imagemin.gifsicle({interlaced: true}),
					imagemin.jpegtran({progressive: true}),
					imagemin.optipng({optimizationLevel: 5}),
					imagemin.svgo({plugins: [{removeViewBox: true}, {cleanupIDs: false}]})
				]))
				.pipe(gulp.dest(appPaths.image.DEST))
				.pipe(browserSync.stream());
});


//Serve task with browsers sync and watchers
gulp.task('serve', function() {

	browserSync.init({server: appPaths.server.root});

	gulp.watch(appPaths.styles.SRC, ['sass']);
	gulp.watch(appPaths.pugTemplates.SRC, ['pug']);
	gulp.watch(appPaths.js.SRC, ['compress']);
	gulp.watch(appPaths.image.SRC, ['images']);
});

gulp.task('default', ['serve']);

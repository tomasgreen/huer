var gulp = require('gulp'),
	rename = require('gulp-rename'),
	streamify = require('gulp-streamify'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	autoprefixer = require('gulp-autoprefixer'),
	minifyCSS = require('gulp-minify-css'),
	argv = require('yargs').argv,
	less = require('gulp-less'),
	serve = (argv.server !== undefined),
	watch = (argv.watch !== undefined),
	spawn = require('child_process').spawn,
	name = require('./package.json').name + '-' + require('./package.json').version,
	node;
/*
	watch
*/
gulp.task('watch', function() {
	gulp.watch('./src/js/**/*.js', ['js']);
	gulp.watch('./src/style/**/*.less', ['less']);
	gulp.watch('./examples/**/*.less', ['examples-less']);
	if (serve) gulp.watch('./server.js', ['serve']);
});
/*
	js
*/
gulp.task('js', function() {
	gulp.src('./src/js/*.js')
		.pipe(concat(name + '.js'))
		.pipe(gulp.dest('./build/'))
		.pipe(gulp.dest('./examples/static'))
		.pipe(rename(name + '.min.js'))
		.pipe(streamify(uglify()))
		.pipe(gulp.dest('./build/'))
		.pipe(gulp.dest('./examples/static'));
});
/*
	css
*/
gulp.task('less', function() {
	gulp.src('./src/style/*.less')
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(rename(name + '.css'))
		.pipe(gulp.dest('./build/'))
		.pipe(gulp.dest('./examples/static'))
		.pipe(rename(name + '.min.css'))
		.pipe(minifyCSS({
			keepSpecialComments: 1
		}))
		.pipe(gulp.dest('./build/'))
		.pipe(gulp.dest('./examples/static'));
});
gulp.task('examples-less', function() {
	gulp.src('./examples/static/*.less')
		.pipe(less())
		.pipe(autoprefixer({
            browsers: ['last 3 versions', 'android >= 4.2'],
			cascade: false
		}))
		.pipe(rename('style.css'))
		.pipe(gulp.dest('./examples/static'));
});
var run = ['js', 'less', 'examples-less'];
if (watch) {
	run.push('watch');
}
if (serve) {
	run.push('serve');
	gulp.task('serve', function() {
		if (node) node.kill();
		node = spawn('node', ['./server.js'], {
			stdio: 'inherit'
		});
	});
}
gulp.task('default', run);
process.on('exit', function() {
	if (node) node.kill();
});
process.on('SIGINT', function() {
	if (node) node.kill();
	process.exit();
});

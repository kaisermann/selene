'use strict';

import args from 'minimist';
import assetBuilder from 'asset-builder';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import browserSyncLib from 'browser-sync';
import changed from 'gulp-changed';
import cmq from 'gulp-combine-mq';
import concat from 'gulp-concat';
import cssnano from 'gulp-cssnano';
import cssstats from 'gulp-stylestats';
import del from 'del';
import flatten from 'gulp-flatten';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import jshint from 'gulp-jshint';
import lazypipe from 'lazypipe';
import merge from 'merge-stream';
import preprocess from 'gulp-preprocess';
import rev from 'gulp-rev';
import runSequence from 'run-sequence';
import sourcemaps from 'gulp-sourcemaps';
import stylus from 'gulp-stylus';
import uglify from 'gulp-uglify';
import util from 'gulp-util';
import wiredepLib from 'wiredep';
import browserify from 'browserify';
import transform from 'vinyl-transform';

let argv = args(process.argv.slice(2))
	, manifest = assetBuilder('./assets/config.json')
	, browserSync = browserSyncLib.create()
	, wiredep = wiredepLib.stream;

let paths = manifest.paths
	, config = manifest.config || {}
	, globs = Object.assign({ misc: ['assets/misc/**/*'] }, manifest.globs)
	, project = manifest.getProjectGlobs()
	, revManifest = paths.dist + 'assets.json';

// CLI parameters
let CLIOpts = {
	maps: argv.maps 							// Disable source maps when `--production`
	, isProduction: argv.production || argv.p 	// Production mode, appends hash of file's content to its name
	, assetdebug: argv.d						// Do not minify assets when '-d'
	, sync: argv.sync							// Start BroswerSync when '--sync'
};

// Error handler
let onError = function (err) {
	util.beep();
	console.log(err);
	this.emit('end');
};

// Path to the compiled assets manifest in the dist directory
let cssTasks = (filename) =>
	lazypipe()
		.pipe(() => gulpif(CLIOpts.maps, sourcemaps.init()))
		.pipe(() => gulpif('*.styl', stylus()))
		.pipe(concat, filename)
		.pipe(autoprefixer, { browsers: config.supportedBrowsers })
		.pipe(cmq, { beautify: CLIOpts.assetdebug })
		.pipe(() => gulpif(!CLIOpts.assetdebug, cssnano()))
		.pipe(() => gulpif(CLIOpts.isProduction, rev()))
		.pipe(() => gulpif(CLIOpts.maps, sourcemaps.write('.')))();

let jsTasks = (filename) =>
	lazypipe()
		.pipe(preprocess)
		.pipe(() => gulpif(CLIOpts.maps, sourcemaps.init()))
		.pipe(babel, { presets: ['es2015'] })
		.pipe(browserify,filename).bundle()
		.pipe(concat, filename)
		//.pipe(() => gulpif(!CLIOpts.assetdebug, uglify()))
		.pipe(() => gulpif(CLIOpts.isProduction, rev()))
		.pipe(() => gulpif(CLIOpts.maps, sourcemaps.write('.')))();

let writeToManifest = (directory) =>
	lazypipe()
		.pipe(gulp.dest, paths.dist + directory)
		.pipe(browserSync.stream, { match: '**/*.{js,css}' })
		.pipe(rev.manifest, revManifest, {
			base: paths.dist
			, merge: true
		})
		.pipe(gulp.dest, paths.dist)();

/* Tasks */
gulp.task('clean', (done) => del([paths.dist], done));

gulp.task('wiredep', (done) => {
	gulp.src(project.css)
		.pipe(wiredep())
		.pipe(changed(paths.source + 'styles', {
			hasChanged: changed.compareSha1Digest
		}))
		.pipe(gulp.dest(paths.source + 'styles'));
	done();
});

gulp.task('jshint', (done) => {
	gulp.src(['bower.json', 'gulpfile.*.js']
		.concat(project.js))
		.pipe(jshint({ "laxcomma": true }))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
		.on('error', onError);
	done();
});

gulp.task('stats', () => gulp.src('./dist/styles/**.css').pipe(cssstats()));

gulp.task('styles', gulp.series('wiredep', function cssMerger(done) {
	let merged = merge();
	manifest.forEachDependency('css', (dep) =>
		merged.add(gulp.src(dep.globs)
			.pipe(cssTasks(dep.name))
			.on('error', onError)
		)
	);
	merged.pipe(writeToManifest('styles'));
	done();
}));

gulp.task('scripts', gulp.series('jshint', function scriptMerger(done) {
	let merged = merge();

	manifest.forEachDependency('js', (dep) =>
		merged.add(gulp.src(dep.globs)
			.pipe(jsTasks(dep.name))
			.on('error', onError)
		)
	);

	merged.pipe(writeToManifest('scripts'));
	done();
}));

gulp.task('fonts', (done) => {
	gulp.src(globs.fonts)
		.pipe(flatten())
		.pipe(gulp.dest(paths.dist + 'fonts'))
		.pipe(browserSync.stream());
	done();
});

gulp.task('images', (done) => {
	gulp.src(globs.images)
		.pipe(imagemin({
			progressive: true
			, interlaced: true
			, svgoPlugins: [{ removeUnknownsAndDefaults: false }, { cleanupIDs: false }]
		}))
		.pipe(gulp.dest(paths.dist + 'images'))
		.pipe(browserSync.stream());
	done();
});

gulp.task('misc', (done) => {
	gulp.src(globs.misc)
		.pipe(gulp.dest(paths.dist + 'misc'))
		.pipe(browserSync.stream());
	done();
});

gulp.task('watch', (done) => {
	if (CLIOpts.sync) {
		browserSync.init({
			files: ['{lib,templates}/**/*.{php,html}', '*.{php,html}']
			, proxy: config.browserSync.devUrl
			, snippetOptions: {
				whitelist: config.browserSync.whitelist,
				blacklist: config.browserSync.blacklist
			}
		});
	}

	gulp.watch([paths.source + 'styles/**/*'], gulp.series('styles'));
	gulp.watch([paths.source + 'scripts/**/*'], gulp.series('jshint', 'scripts'));
	gulp.watch([paths.source + 'fonts/**/*'], gulp.series('fonts'));
	gulp.watch([paths.source + 'images/**/*'], gulp.series('images'));
	gulp.watch([paths.source + 'misc/**/*'], gulp.series('misc'));
	gulp.watch(['bower.json', 'assets/config.json'], gulp.series('build'));
	done();
});

gulp.task('compile', gulp.parallel('styles', 'scripts', 'fonts', 'images', 'misc'));
gulp.task('build', gulp.series('clean', 'compile'));
gulp.task('default', gulp.series('build'));
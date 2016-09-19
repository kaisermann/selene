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

const argv = args(process.argv.slice(2))
	, manifest = assetBuilder('./assets/config.json')
	, browserSync = browserSyncLib.create()
	, wiredep = wiredepLib.stream;

const paths = manifest.paths
	, config = manifest.config || {}
	, globs = Object.assign({ misc: ['assets/misc/**/*'] }, manifest.globs)
	, project = manifest.getProjectGlobs()
	, revManifest = paths.dist + 'assets.json';

// CLI parameters
const CLIOpts = {
	maps: argv.maps 							// Disable source maps when `--production`
	, isProduction: argv.production || argv.p 	// Production mode, appends hash of file's content to its name
	, assetdebug: argv.d						// Do not minify assets when '-d'
	, sync: argv.sync							// Start BroswerSync when '--sync'
};

// Error handler
const onError = function (err) {
	util.beep();
	console.log(err);
	this.emit('end');
};

// Path to the compiled assets manifest in the dist directory
const cssTasks = (filename) =>
	lazypipe()
		.pipe(() => gulpif(CLIOpts.maps, sourcemaps.init()))
		.pipe(() => gulpif('*.styl', stylus()))
		.pipe(concat, filename)
		.pipe(autoprefixer, { browsers: config.prefixes })
		.pipe(cmq, { beautify: CLIOpts.assetdebug })
		.pipe(() => gulpif(!CLIOpts.assetdebug, cssnano()))
		.pipe(() => gulpif(CLIOpts.isProduction, rev()))
		.pipe(() => gulpif(CLIOpts.maps, sourcemaps.write('.')))()
		.on('error', onError);

const jsTasks = (filename) =>
	lazypipe()
		.pipe(preprocess)
		.pipe(() => gulpif(CLIOpts.maps, sourcemaps.init()))
		.pipe(babel, { presets: ['es2015'] })
		.pipe(concat, filename)
		.pipe(() => gulpif(!CLIOpts.assetdebug, uglify()))
		.pipe(() => gulpif(CLIOpts.isProduction, rev()))
		.pipe(() => gulpif(CLIOpts.maps, sourcemaps.write('.')))()
		.on('error', onError);

const writeToManifest = (directory) =>
	lazypipe()
		.pipe(gulp.dest, paths.dist + directory)
		.pipe(browserSync.stream, { match: '**/*.{js,css}' })
		.pipe(rev.manifest, revManifest, {
			base: paths.dist
			, merge: true
		})
		.pipe(gulp.dest, paths.dist)();

/* Tasks */
gulp.task('stats', () => gulp.src('./dist/styles/**.css').pipe(cssstats()));

gulp.task('styles', ['wiredep'], () => {
	const merged = merge();
	manifest.forEachDependency('css', (dep) => {
		merged.add(gulp.src(dep.globs)
			.pipe(cssTasks(dep.name)));
	});
	return merged.pipe(writeToManifest('styles'));
});

gulp.task('scripts', ['jshint'], () => {
	const merged = merge();
	manifest.forEachDependency('js', (dep) => {
		merged.add(gulp.src(dep.globs)
			.pipe(jsTasks(dep.name))
		);
	});
	return merged.pipe(writeToManifest('scripts'));
});

gulp.task('fonts', () =>
	gulp.src(globs.fonts)
		.pipe(flatten())
		.pipe(gulp.dest(paths.dist + 'fonts'))
		.pipe(browserSync.stream())
);

gulp.task('images', () =>
	gulp.src(globs.images)
		.pipe(imagemin({
			progressive: true
			, interlaced: true
			, svgoPlugins: [{ removeUnknownsAndDefaults: false }, { cleanupIDs: false }]
		}))
		.pipe(gulp.dest(paths.dist + 'images'))
		.pipe(browserSync.stream())
);

gulp.task('misc', () =>
	gulp.src(globs.misc)
		.pipe(gulp.dest(paths.dist + 'misc'))
		.pipe(browserSync.stream())
);

gulp.task('jshint', () =>
	gulp.src(['bower.json', 'gulpfile.js']
		.concat(project.js))
		.pipe(jshint({ "laxcomma": true }))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
);

gulp.task('clean', del.bind(null, [paths.dist]));

gulp.task('watch', () => {
	if (CLIOpts.sync) {
		browserSync.init({
			files: ['{lib,templates}/**/*.{php,html}', '*.{php,html}']
			, proxy: config.devUrl
			, snippetOptions: {
				whitelist: ['/wp-admin/admin-ajax.php'],
				blacklist: ['/wp-admin/**']
			}
		});
	}
	gulp.watch([paths.source + 'styles/**/*'], ['styles']);
	gulp.watch([paths.source + 'scripts/**/*'], ['jshint', 'scripts']);
	gulp.watch([paths.source + 'fonts/**/*'], ['fonts']);
	gulp.watch([paths.source + 'images/**/*'], ['images']);
	gulp.watch([paths.source + 'misc/**/*'], ['misc']);
	gulp.watch(['bower.json', 'assets/config.json'], ['build']);
});

gulp.task('build', ['clean'], (callback) =>
	runSequence('styles', 'scripts', ['fonts', 'images', 'misc'], callback)
);

gulp.task('wiredep', () =>
	gulp.src(project.css)
		.pipe(wiredep())
		.pipe(changed(paths.source + 'styles', {
			hasChanged: changed.compareSha1Digest
		}))
		.pipe(gulp.dest(paths.source + 'styles'))
);

gulp.task('default', () => gulp.start('build'));

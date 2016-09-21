/*jshint loopfunc: true */
'use strict';

import args from 'minimist';
import assetBuilder from 'asset-builder';
import autoprefixer from 'gulp-autoprefixer';
import browserify from 'browserify';
import browserSyncLib from 'browser-sync';
import cache from 'gulp-memory-cache';
import changed from 'gulp-changed';
import cmq from 'gulp-combine-mq';
import concat from 'gulp-concat';
import cssnano from 'gulp-cssnano';
import cssstats from 'gulp-stylestats';
import del from 'del';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import jshint from 'gulp-jshint';
import lazypipe from 'lazypipe';
import merge from 'merge-stream';
import print from 'gulp-print';
import rev from 'gulp-rev';
import sourcemaps from 'gulp-sourcemaps';
import stylus from 'gulp-stylus';
import through2 from 'through2';
import uglify from 'gulp-uglify';
import util from 'gulp-util';
import wiredepLib from 'wiredep';

const argv = args(process.argv.slice(2))
	, manifest = assetBuilder('./assets/config.json')
	, browserSync = browserSyncLib.create()
	, wiredep = wiredepLib.stream;

const paths = manifest.config.paths
	, config = manifest.config || {}
	, globs = manifest.globs
	, project = manifest.getProjectGlobs()
	, revManifest = paths.dist + 'assets.json';

const compileTaskList = Object.keys(manifest.assets);

// CLI parameters
const CLIOpts = {
	maps: argv.maps 							// Disable source maps when `--production`
	, production: argv.production || argv.p 	// Production mode, appends hash of file's content to its name
	, debug: argv.d								// Do not minify assets when '-d'
	, sync: argv.sync							// Start BroswerSync when '--sync'
};

const taskHelpers = {
	styles: filename => {
		return lazypipe()
			.pipe(() => gulpif(CLIOpts.maps, sourcemaps.init()))
			.pipe(() => gulpif('*.styl', stylus()))
			.pipe(concat, filename)
			.pipe(autoprefixer, { browsers: config.supportedBrowsers })
			.pipe(cmq, { beautify: CLIOpts.debug })
			.pipe(() => gulpif(!CLIOpts.debug, cssnano()))
			.pipe(() => gulpif(CLIOpts.production, rev()))
			.pipe(() => gulpif(CLIOpts.maps, sourcemaps.write('.', {
				sourceRoot: paths.source + 'styles/'
			})))
			();
	},
	scripts: filename => {
		return lazypipe()
			.pipe(() => gulpif(CLIOpts.maps, sourcemaps.init()))
			.pipe(through2.obj, (file, enc, next) =>
				browserify(file.path, { debug: false })
					.transform('babelify', { presets: ["es2015"], sourceMaps: false })
					.bundle(function (err, res) {
						if (err)
							return next(err);
						file.contents = res;
						next(null, file);
					})
			)
			.pipe(concat, filename)
			.pipe(() => gulpif(!CLIOpts.debug, uglify()))
			.pipe(() => gulpif(CLIOpts.production, rev()))
			.pipe(() => gulpif(CLIOpts.maps, sourcemaps.write('.', {
				sourceRoot: paths.source + 'scripts/'
			})))
			();
	},
	images: filename => {
		return lazypipe()
			.pipe(imagemin, {
				progressive: true
				, interlaced: true
				, svgoPlugins: [{ removeUnknownsAndDefaults: false }, { cleanupIDs: false }]
			})
			();
	},
	writeToManifest: directory => {
		return lazypipe()
			.pipe(gulp.dest, paths.dist + directory + '/')
			.pipe(browserSync.stream, { match: '**/*.{js,css}' })
			.pipe(rev.manifest, revManifest, {
				base: paths.dist
				, merge: true
			})
			.pipe(gulp.dest, paths.dist)
			();
	}
};

// Tasks
gulp.task('wiredep', (done) => {
	gulp.src(project.styles)
		.pipe(wiredep())
		.pipe(changed(paths.source + 'styles/', {
			hasChanged: changed.compareSha1Digest
		}))
		.pipe(gulp.dest(paths.source + 'styles/'));
	done();
});

gulp.task('jshint', (done) => {
	gulp.src(['bower.json', 'gulpfile.*.js'].concat(project.scripts), { since: gulp.lastRun('jshint') })
		.pipe(print())
		.pipe(jshint({ "laxcomma": true }))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(gulpif(CLIOpts.production, jshint.reporter('fail')));
	done();
});

gulp.task('styles', gulp.series('wiredep', function cssMerger(done) {
	const merged = merge();

	manifest.forEachAsset('styles', (asset) => {
		return merged.add(gulp.src(asset.globs, { since: cache.lastMtime('styles') })
			.pipe(cache('styles'))
			.pipe(taskHelpers.styles(asset.name))
			.on('error', function (err) {
				util.beep();
				console.error(err.message);
				this.emit('end');
			})
		);
	});
	merged.pipe(taskHelpers.writeToManifest('styles'));
	done();
}));

gulp.task('scripts', gulp.series('jshint', function scriptMerger(done) {
	const merged = merge();

	manifest.forEachAsset('scripts', (asset) => {
		return merged.add(gulp.src(asset.globs, { since: cache.lastMtime('scripts') })
			.pipe(cache('scripts'))
			.pipe(taskHelpers.scripts(asset.name))
			.on('error', function (err) {
				util.beep();
				if (CLIOpts.production)
					return;
				console.error(err.message);
				this.emit('end');
			})
		);
	}
	);
	merged.pipe(taskHelpers.writeToManifest('scripts'));
	done();
}));

/* Creates the 'simple tasks' defined in manifest.config.simpleTasks */
for (let i = 0, len = config.simpleTasks.length; i < len; i++) {
	const taskName = config.simpleTasks[i];
	gulp.task(taskName, (function () {
		const currentTaskName = taskName
			, currentTaskOpts = config.simpleTasks[currentTaskName];

		return function (done) {
			manifest.forEachAsset(currentTaskName, (asset) => {
				gulp.src(asset.globs)
					.pipe((!!taskHelpers[currentTaskName]) ? // Has helper?
						taskHelpers[currentTaskName](asset.name) // Yes!
						:
						util.noop() // Noop(e)!
					)
					.pipe(gulp.dest(paths.dist + taskName + '/'))
					.pipe(browserSync.stream());
				done();
			});
		};
	})());
}

gulp.task('watch', (done) => {
	if (!!config.browserSync && CLIOpts.sync) {
		browserSync.init({
			files: config.browserSync.files
			, proxy: config.browserSync.devUrl
			, snippetOptions: {
				whitelist: config.browserSync.whitelist,
				blacklist: config.browserSync.blacklist
			}
		});
	}

	// Watch based on file-types
	for (let i = 0, len = compileTaskList.length; i < len; i++) {
		const taskName = compileTaskList[i];
		gulp
			.watch([paths.source + taskName + '/**/*'], gulp.series(taskName))
			.on('change', cache.update(taskName));
	}
	gulp.watch(['bower.json', 'assets/config.json'], gulp.series('build'));

	done();
});

gulp.task('stats', () => gulp.src('./dist/styles/**.css').pipe(cssstats()));

gulp.task('compile', gulp.parallel(compileTaskList));

gulp.task('clean', (done) => del([paths.dist], done));

gulp.task('build', gulp.series('clean', 'compile'));

gulp.task('default', gulp.series('build'));

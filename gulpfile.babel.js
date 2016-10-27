/* eslint prefer-arrow-callback: "off" */
import args from 'minimist';
import assetBuilder from 'asset-builder';
import autoprefixer from 'gulp-autoprefixer';
import browserSyncLib from 'browser-sync';
import browserify from 'browserify';
import cache from 'gulp-memory-cache';
import clipEmptyFiles from 'gulp-clip-empty-files';
import cmq from 'gulp-combine-mq';
import concat from 'gulp-concat';
import changed from 'gulp-changed';
import cssnano from 'gulp-cssnano';
import cssstats from 'gulp-stylestats';
import del from 'del';
import flatten from 'gulp-flatten';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import eslint from 'gulp-eslint';
import lazypipe from 'lazypipe';
import merge from 'merge-stream';
import path from 'path';
import plumber from 'gulp-plumber';
import rev from 'gulp-rev';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import stylus from 'gulp-stylus';
import through2 from 'through2';
import uglify from 'gulp-uglify';
import util from 'gulp-util';
import wiredepLib from 'wiredep';
import _ from 'lodash';

// Path to the main manifest file.
const mainManifestPath = './phase.json';
const phase = assetBuilder(mainManifestPath);

const argv = args(process.argv.slice(2));
const browserSync = browserSyncLib.create();

// Sets configuration default values if needed
phase.config = _.merge({
  paths: {
    revisionManifest: 'assets.json',
  },
  supportedBrowsers: ['last 2 versions', 'opera 12', 'IE 10'],
  browserSync: {
    files: [],
    whitelist: [],
    blacklist: [],
  },
}, phase.config);

phase.projectGlobs = phase.getProjectGlobs();
phase.params = {
  maps: argv.maps, // Enables sourcemaps creation when '--maps'
  production: argv.p, // Production mode, appends hash of file's content to its name
  debug: argv.d, // Do not minify assets when '-d'
  sync: argv.sync, // Start BroswerSync when '--sync'
};

/**
 * Task helpers are used to modify a stream in the middle of a task.
 * It allows customization of the stream for automatically created simple tasks
 * (phase.json -> resource -> simpleTask:true).
 */

const taskHelpers = {
  styles(outputName) {
    return lazypipe()
      .pipe(() => gulpif(phase.params.maps, sourcemaps.init()))
      .pipe(() => gulpif('*.styl', stylus()))
      .pipe(() => gulpif('*.{scss,sass}', sass({
        outputStyle: 'expanded',
        precision: 8,
      })))
      .pipe(concat, outputName)
      .pipe(autoprefixer, {
        browsers: phase.config.supportedBrowsers,
      })
      .pipe(cmq)
      .pipe(() => gulpif(!phase.params.debug, cssnano({
        safe: true,
      })))
      .pipe(() => gulpif(phase.params.production, rev()))
      .pipe(() => gulpif(phase.params.maps, sourcemaps.write('.', {
        sourceRoot: path.join(phase.config.paths.source, phase.resources.styles.directory),
      })))();
  },
  scripts(outputName) {
    return lazypipe()
      .pipe(() => gulpif(phase.params.maps, sourcemaps.init()))
      .pipe(through2.obj, function (file, enc, next) {
        return browserify(file.path, {
            debug: false,
          })
          .transform('babelify', {
            presets: ['es2015'],
            sourceMaps: false,
          })
          .bundle((err, res) => {
            const tmpFile = file;
            if (err) {
              return next(err);
            }
            tmpFile.contents = res;
            next(null, tmpFile);
            return true;
          });
      })
      .pipe(concat, outputName)
      .pipe(() => gulpif(!phase.params.debug, uglify()))
      .pipe(() => gulpif(phase.params.production, rev()))
      .pipe(() => gulpif(phase.params.maps, sourcemaps.write('.', {
        sourceRoot: path.join(phase.config.paths.source, phase.resources.scripts.directory),
      })))();
  },
  fonts() {
    return lazypipe()
      .pipe(flatten)();
  },
  images() {
    return lazypipe()
      .pipe(imagemin, {
        progressive: true,
        interlaced: true,
        svgoPlugins: [{
          removeUnknownsAndDefaults: true,
        }, {
          cleanupIDs: false,
        }],
      })();
  },
};

const writeToManifest = function (directory) {
  return lazypipe()
    .pipe(gulp.dest, path.join(phase.config.paths.dist, directory))
    .pipe(browserSync.stream, {
      match: '**/*.{js,css}',
    })
    .pipe(rev.manifest, path.join(phase.config.paths.dist, phase.config.paths.revisionManifest), {
      base: phase.config.paths.dist,
      merge: true,
    })
    .pipe(gulp.dest, phase.config.paths.dist)();
};


/* Tasks */
gulp.task('wiredep', (done) => {
  const wiredep = wiredepLib.stream;

  gulp.src(phase.projectGlobs.styles, {
      base: './',
    })
    .pipe(clipEmptyFiles()) // Clips empty files (wiredep issue #219)
    .pipe(wiredep())
    .pipe(changed('./', {
      hasChanged: changed.compareSha1Digest,
    }))
    .pipe(gulp.dest('.'))
    // Signals 'done' only when files are done being written
    .on('end', done)
    .on('error', done);
});

gulp.task('jslinter', (done) => {
  gulp.src(['gulpfile.*.js'].concat(phase.projectGlobs.scripts), {
      since: gulp.lastRun('jslinter'),
    })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(phase.params.production, eslint.failAfterError()));
  done();
});

gulp.task('styles', gulp.series('wiredep', function cssMerger(done) {
  const merged = merge();

  phase.forEachAsset('styles', function (asset) {
    return merged.add(gulp.src(asset.globs, {
        since: cache.lastMtime(`styles-${asset.outputName}`),
      })
      .pipe(plumber())
      .pipe(cache(`styles-${asset.outputName}`))
      .pipe(taskHelpers.styles(asset.outputName))
    );
  });
  merged.pipe(writeToManifest(phase.resources.styles.directory));
  done();
}));

gulp.task('scripts', gulp.series('jslinter', function scriptMerger(done) {
  const merged = merge();

  phase.forEachAsset('scripts', function (asset) {
    return merged.add(gulp.src(asset.globs, {
        since: cache.lastMtime(`scripts-${asset.outputName}`),
      })
      .pipe(plumber())
      .pipe(cache(`scripts-${asset.outputName}`))
      .pipe(taskHelpers.scripts(asset.outputName))
    );
  });

  merged.pipe(writeToManifest(phase.resources.scripts.directory));
  done();
}));

// Automatically creates the 'simple tasks' defined
// in manifest.resources.TYPE.simpleTask = true|false
(() => {
  const simpleTaskHelper = function (resourceType, resourceInfo) {
    return function (done) {
      phase.forEachAsset(resourceType, (asset) => {
        gulp.src(asset.globs)
          .pipe(plumber())
          .pipe((taskHelpers[resourceType]) ? // Has helper?
            taskHelpers[resourceType](asset.outputName) // Yes!
            :
            util.noop() // Noop(e)!
          )
          .pipe(gulp.dest(path.join(phase.config.paths.dist,
            resourceInfo.directory, asset.outputName)))
          .pipe(browserSync.stream({
            match: `**/${resourceInfo.pattern}`,
          }));
      });
      done();
    };
  };

  for (const resourceType of Object.keys(phase.resources)) {
    const resourceInfo = phase.resources[resourceType];
    if (resourceInfo.simpleTask) {
      gulp.task(resourceType, simpleTaskHelper(resourceType, resourceInfo));
    }
  }
})();

gulp.task('watch', function (done) {
  const updateResourceCache = function (resourceType) {
    return function () {
      phase.forEachAsset(resourceType, (asset) => {
        cache.update(`${resourceType}-${asset.outputName}`);
      });
    };
  };

  if (!!phase.config.browserSync && phase.params.sync) {
    browserSync.init({
      files: phase.config.browserSync.files,
      proxy: phase.config.browserSync.devUrl,
      snippetOptions: {
        whitelist: phase.config.browserSync.whitelist,
        blacklist: phase.config.browserSync.blacklist,
      },
    });
  }

  // Watch based on resource-type-names
  for (const resourceType of Object.keys(phase.resources)) {
    const resourceInfo = phase.resources[resourceType];

    const watchInstance = gulp.watch(
      [path.join(phase.config.paths.source, resourceInfo.directory, '/**/*')],
      gulp.series(resourceType)
    );

    // If watching scripts & styles we must update the resource cache
    if (['styles', 'scripts'].indexOf(resourceType) >= 0) {
      watchInstance.on('change', updateResourceCache(resourceType));
    }
  }
  gulp.watch(['bower.json', 'phase.json'], gulp.series('build'));

  done();
});

gulp.task('css-stats', () => gulp.src(path.join(phase.config.paths.dist, phase.resources.styles.directory, './**.css')).pipe(cssstats()));

gulp.task('clean', done => del([phase.config.paths.dist], done));

gulp.task('compile', gulp.parallel(Object.keys(phase.resources)));

gulp.task('build', gulp.series('clean', 'compile'));

gulp.task('default', gulp.series('build'));

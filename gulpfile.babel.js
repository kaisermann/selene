import _ from 'lodash';
import args from 'minimist';
import assetBuilder from 'asset-builder';
import autoprefixer from 'gulp-autoprefixer';
import browserify from 'browserify';
import browserSyncLib from 'browser-sync';
import changed from 'gulp-changed';
import clipEmptyFiles from 'gulp-clip-empty-files';
import cmq from 'gulp-combine-mq';
import concat from 'gulp-concat';
import cssnano from 'gulp-cssnano';
import cssstats from 'gulp-stylestats';
import del from 'del';
import exhaust from 'stream-exhaust';
import flatten from 'gulp-flatten';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import jshint from 'gulp-jshint';
import lazypipe from 'lazypipe';
import merge from 'merge-stream';
import path from 'path';
import plumber from 'gulp-plumber';
import rev from 'gulp-rev';
import stylus from 'gulp-stylus';
import through2 from 'through2';
import uglify from 'gulp-uglify';
import util from 'gulp-util';
import wiredepLib from 'wiredep';

// Path to the main manifest file.
const mainManifestPath = './sepha.json';
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
  debug: argv.d, // Do not minify assets when '-d'
  production: argv.p, // Production mode, appends hash of file's content to its name
  sync: argv.sync, // Start BroswerSync when '--sync'
};

/**
 * Task helpers are used to modify a stream in the middle of a task.
 * It allows customization of the stream for automatically created simple tasks
 * (sepha.json -> resource -> dynamicTask:true).
 */

const taskHelpers = {
  styles(outputName) {
    return lazypipe()
      .pipe(() => gulpif('*.styl', stylus()))
      .pipe(concat, outputName)
      .pipe(autoprefixer, {
        browsers: phase.config.supportedBrowsers,
      })
      .pipe(cmq)
      .pipe(() => gulpif(!phase.params.debug, cssnano({
        safe: true,
      })))
      .pipe(() => gulpif(phase.params.production, rev()))
      ();
  },
  scripts(outputName) {
    return lazypipe()
      // Only pipes our main code (not bower's) to browserify
      .pipe(() => gulpif((file) => {
        return phase.projectGlobs.scripts.some(e => file.path.endsWith(e));
      }, through2.obj((file, enc, next) => {
        return browserify(file.path, {
            debug: false,
          })
          .transform('babelify', {
            presets: ['es2015'],
            sourceMaps: false,
            compact: false
          })
          .bundle((err, res) => {
            const tmpFile = file;
            if (err) {
              return next(err);
            }
            tmpFile.contents = res;
            return next(null, tmpFile);
          });
      })))
      .pipe(concat, outputName)
      .pipe(() => gulpif(!phase.params.debug, uglify()))
      .pipe(() => gulpif(phase.params.production, rev()))
      ();
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

const onError = function (err) {
  util.beep();
  util.log(err.message);
  this.emit('end');
};

const writeToManifest = (directory) => {
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

gulp.task('jsLinter', (done) => {
  gulp.src(['gulpfile.*.js'].concat(phase.projectGlobs.scripts), {
      since: gulp.lastRun('jsLinter'),
    })
    .pipe(jshint({
      "laxcomma": true
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .on('end', done)
    .on('error', done)
    .pipe(gulpif(phase.params.production, jshint.reporter('fail')));
});

/* Tasks */
gulp.task('wiredep', (done) => {
  const wiredep = wiredepLib.stream;
  const stylesDir = path.join(phase.config.paths.source, phase.resources.styles.directory);

  return gulp.src(phase.projectGlobs.styles)
    .pipe(clipEmptyFiles()) // Clips empty files (wiredep issue #219)
    .pipe(wiredep())
    .pipe(changed(stylesDir, {
      hasChanged: changed.compareSha1Digest,
    }))
    .pipe(gulp.dest(stylesDir))
    // Signals 'done' only when fiFles are done being written
    .on('end', done)
    .on('error', done);
});

gulp.task('styles', gulp.series('wiredep', function cssMerger(done) {
  const merged = merge();

  phase.forEachAsset('styles', (asset) => {
    return merged.add(gulp.src(asset.globs, {
        base: phase.resources.styles.directory,
      })
      .pipe(plumber({
        errorHandler: onError
      }))
      .pipe(taskHelpers.styles(asset.outputName))
    );
  });
  merged.pipe(writeToManifest(phase.resources.styles.directory))
    .on('end', done)
    .on('error', done);
}));

gulp.task('scripts', gulp.series('jsLinter', function scriptMerger(done) {
  const merged = merge();

  phase.forEachAsset('scripts', (asset) => {
    return merged.add(gulp.src(asset.globs, {
        base: phase.resources.scripts.directory,
      })
      .pipe(plumber({
        errorHandler: onError
      }))
      .pipe(taskHelpers.scripts(asset.outputName))
    );
  });

  merged.pipe(writeToManifest(phase.resources.scripts.directory))
    .on('end', done)
    .on('error', done);
}));

// Automatically creates the 'simple tasks' defined
// in manifest.resources.TYPE.dynamicTask = true|false
(() => {
  const dynamicTaskHelper = (resourceType, resourceInfo) => {
    return (done) => {
      let counter = 0;
      phase.forEachAsset(resourceType, (asset) => {
        exhaust(gulp.src(asset.globs)
            .pipe(plumber({
              errorHandler: onError
            }))
            .pipe(gulpif(taskHelpers[resourceType], taskHelpers[resourceType](asset.outputName)))
            .pipe(gulp.dest(path.join(phase.config.paths.dist,
              resourceInfo.directory, asset.outputName)))
            .pipe(browserSync.stream({
              match: `**/${resourceInfo.pattern}`,
            }))
          )
          .on('end', () => {
            if (++counter === phase.projectGlobs[resourceType].length) {
              done();
            }
          })
          .on('error', () => {
            if (++counter === phase.projectGlobs[resourceType].length) {
              done();
            }
          });
      });
    };
  };

  for (const resourceType of Object.keys(phase.resources)) {
    const resourceInfo = phase.resources[resourceType];
    if (resourceInfo.dynamicTask) {
      gulp.task(resourceType, dynamicTaskHelper(resourceType, resourceInfo));
    }
  }
})();

gulp.task('watch', function (done) {

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

    gulp.watch([
        path.join(phase.config.paths.source, resourceInfo.directory, '/**/*')
      ],
      gulp.series(resourceType)
    );
  }
  gulp.watch(['bower.json', 'sepha.json'], gulp.series('build'));

  done();
});

gulp.task('css-stats', () => gulp.src(path.join(phase.config.paths.dist, phase.resources.styles.directory, './**.css')).pipe(cssstats()));

gulp.task('clean', done => del([phase.config.paths.dist], done));

gulp.task('compile', gulp.parallel(Object.keys(phase.resources)));

gulp.task('build', gulp.series('clean', 'compile'));

gulp.task('default', gulp.series('build'));

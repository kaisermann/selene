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
import plumber from 'gulp-plumber';
import imagemin from 'gulp-imagemin';
import flatten from 'gulp-flatten';
import jshint from 'gulp-jshint';
import lazypipe from 'lazypipe';
import merge from 'merge-stream';
import path from 'path';
import print from 'gulp-print';
import rev from 'gulp-rev';
import sourcemaps from 'gulp-sourcemaps';
import stylus from 'gulp-stylus';
import through2 from 'through2';
import uglify from 'gulp-uglify';
import util from 'gulp-util';
import wiredepLib from 'wiredep';

// CLI parameters
const argv = args(process.argv.slice(2));

const manifest = assetBuilder('./phase.json'),
  browserSync = browserSyncLib.create(),
  wiredep = wiredepLib.stream;

const paths = manifest.config.paths,
  resources = manifest.resources,
  config = manifest.config || {},
  project = manifest.getProjectGlobs(),
  revManifest = path.join(paths.dist, 'assets.json');
/**
 * List of task names that should run in parallel during the building of assets.
 * By default, it assumes that your tasks are composed by your resource types defined on 'phase.json'.
 */
const compileTaskList = Object.keys(resources);

const CLIOpts = {
  maps: argv.maps, // Enables sourcemaps creation when '--maps'
  production: argv.production || argv.p, // Production mode, appends hash of file's content to its name
  debug: argv.d, // Do not minify assets when '-d'
  sync: argv.sync // Start BroswerSync when '--sync'
};

/**
 * Task helpers are used to modify a stream in the middle of a task.
 * It allows customization of the stream for automatically created simple tasks
 * (phase.json -> resource -> simpleTask:true).
 */

const taskHelpers = {
  styles: (outputName) => {
    return lazypipe()
      .pipe(() => gulpif(CLIOpts.maps, sourcemaps.init()))
      .pipe(() => gulpif('*.styl', stylus()))
      .pipe(concat, outputName)
      .pipe(autoprefixer, {
        browsers: config.supportedBrowsers
      })
      .pipe(cmq, {
        beautify: CLIOpts.debug
      })
      .pipe(() => gulpif(!CLIOpts.debug, cssnano()))
      .pipe(() => gulpif(CLIOpts.production, rev()))
      .pipe(() => gulpif(CLIOpts.maps, sourcemaps.write('.', {
        sourceRoot: path.join(paths.source, resources.styles.directory)
      })))
      ();
  },
  scripts: (outputName) => {
    return lazypipe()
      .pipe(() => gulpif(CLIOpts.maps, sourcemaps.init()))
      .pipe(through2.obj, (file, enc, next) =>
        browserify(file.path, {
          debug: false
        })
        .transform('babelify', {
          presets: ["es2015"],
          sourceMaps: false
        })
        .bundle(function (err, res) {
          if(err)
            return next(err);
          file.contents = res;
          next(null, file);
        })
      )
      .pipe(concat, outputName)
      .pipe(() => gulpif(!CLIOpts.debug, uglify()))
      .pipe(() => gulpif(CLIOpts.production, rev()))
      .pipe(() => gulpif(CLIOpts.maps, sourcemaps.write('.', {
        sourceRoot: path.join(paths.source, resources.scripts.directory)
      })))
      ();
  },
  fonts: (outputName) => {
    return lazypipe()
      .pipe(flatten)
      ();
  },
  images: (outputName) => {
    return lazypipe()
      .pipe(imagemin, {
        progressive: true,
        interlaced: true,
        svgoPlugins: [{
          removeUnknownsAndDefaults: true
        }, {
          cleanupIDs: false
        }]
      })
      ();
  }
};

const writeToManifest = (directory) => {
  return lazypipe()
    .pipe(gulp.dest, path.join(paths.dist, directory))
    .pipe(browserSync.stream, {
      match: '**/*.{js,css}'
    })
    .pipe(rev.manifest, revManifest, {
      base: paths.dist,
      merge: true
    })
    .pipe(gulp.dest, paths.dist)
    ();
};


/* Tasks */
gulp.task('wiredep', (done) => {
  gulp.src(project.styles)
    .pipe(wiredep())
    .pipe(changed(path.join(paths.source, 'styles/'), {
      hasChanged: changed.compareSha1Digest
    }))
    .pipe(gulp.dest(path.join(paths.source, 'styles/')));
  done();
});

gulp.task('jshint', (done) => {
  gulp.src(['bower.json', 'gulpfile.*.js'].concat(project.scripts), {
      since: gulp.lastRun('jshint')
    })
    .pipe(jshint({
      "laxcomma": true
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulpif(CLIOpts.production, jshint.reporter('fail')));
  done();
});

gulp.task('styles', gulp.series('wiredep', function cssMerger(done) {
  const merged = merge();

  manifest.forEachAsset('styles', (asset) => {
    return merged.add(gulp.src(asset.globs, {
        since: cache.lastMtime('styles')
      })
      .pipe(plumber())
      .pipe(cache('styles'))
      .pipe(taskHelpers.styles(asset.output))
    );
  });
  merged.pipe(writeToManifest(resources.styles.directory));
  done();
}));

gulp.task('scripts', gulp.series('jshint', function scriptMerger(done) {
  const merged = merge();

  manifest.forEachAsset('scripts', (asset) => {
    return merged.add(gulp.src(asset.globs, {
        since: cache.lastMtime('scripts')
      })
      .pipe(plumber())
      .pipe(cache('scripts'))
      .pipe(taskHelpers.scripts(asset.output))
    );
  });

  merged.pipe(writeToManifest(resources.scripts.directory));
  done();
}));

/* Automatically creates the 'simple tasks' defined in manifest.resources.TYPE.simpleTask = true|false */
const simpleTaskHelper = (resourceType, resourceInfo) => {
  return function (done) {
    manifest.forEachAsset(resourceType, (asset) => {
      gulp.src(asset.globs)
        .pipe(plumber())
        .pipe((!!taskHelpers[resourceType]) ? // Has helper?
          taskHelpers[resourceType](asset.output) // Yes!
          :
          util.noop() // Noop(e)!
        )
        .pipe(gulp.dest(path.join(paths.dist, resourceInfo.directory, asset.output)))
        .pipe(browserSync.stream({
          match: '**/' + resourceInfo.pattern
        }));
    });
    done();
  };
};

for(let resourceType in resources) {
  if(!!resources[resourceType].simpleTask) {
    gulp.task(resourceType, simpleTaskHelper(resourceType, resources[resourceType]));
  }
}

gulp.task('watch', (done) => {
  if(!!config.browserSync && CLIOpts.sync) {
    browserSync.init({
      files: config.browserSync.files,
      proxy: config.browserSync.devUrl,
      snippetOptions: {
        whitelist: config.browserSync.whitelist,
        blacklist: config.browserSync.blacklist
      }
    });
  }

  /* Watch based on resource-type-names */
  for(let i = 0, len = compileTaskList.length; i < len; i++) {
    const resourceType = compileTaskList[i];
    const watchInstance = gulp.watch([path.join(paths.source, resources[resourceType].directory, '/**/*')], gulp.series(resourceType));

    // If watching scripts & styles we must update the resource cache
    if(['styles', 'scripts'].indexOf(resourceType) >= 0) {
      watchInstance.on('change', cache.update(resourceType));
    }
  }
  gulp.watch(['bower.json', 'phase.json'], gulp.series('build'));

  done();
});

gulp.task('css-stats', () => gulp.src(path.join(paths.dist, resources.styles.directory, './**.css')).pipe(cssstats()));

gulp.task('compile', gulp.parallel(compileTaskList));

gulp.task('clean', (done) => del([paths.dist], done));

gulp.task('build', gulp.series('clean', 'compile'));

gulp.task('default', gulp.series('build'));

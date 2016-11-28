const readFileSync = require('fs').readFileSync;
const accessSync = require('fs').accessSync;
const j = require('path').join;
const relativePath = require('path').relative;
const execSync = require('child_process').execSync;

const _ = require('lodash');
const minimist = require('minimist');
const assetOrchestrator = require('asset-orchestrator');
const browserSyncLib = require('browser-sync');
const concat = require('gulp-concat');
const del = require('del');
const exhaust = require('stream-exhaust');
const flatten = require('gulp-flatten');
const sourcemaps = require('gulp-sourcemaps');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const jshint = require('gulp-jshint');
const lazypipe = require('lazypipe');
const merge = require('merge-stream');
const plumber = require('gulp-plumber');
const rev = require('gulp-rev');
const stylus = require('gulp-stylus');
const uglify = require('gulp-uglify');
const util = require('gulp-util');
const rollup = require('gulp-better-rollup');
const buble = require('rollup-plugin-buble');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const postCSS = require('gulp-postcss');
const cssmqpacker = require('css-mqpacker');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const uncss = require('gulp-uncss');
const size = require('gulp-size');

const argv = minimist(process.argv.slice(2));
const browserSync = browserSyncLib.create();

// Path to the main manifest file.
const mainManifestPath = './phase.json';
const phase = assetOrchestrator(mainManifestPath);

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
  maps: !argv.p, // Create sourcemaps when not in production mode
  production: argv.p, // Production mode, appends hash of file's content to its name
  sync: argv.sync, // Start BroswerSync when '--sync'
};

const onError = function (err) {
  util.beep();
  util.log(err.message);
  this.emit('end');
};

const pathExists = function (path) {
  try {
    accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
};

const getResourceDir = (folder, type, ...appendix) => {
  return j(phase.config.paths[folder],
    phase.resources[type] ? phase.resources[type].directory : type,
    ...appendix);
};

const distToAssetPath = relativePath(
  getResourceDir('dist', 'any'),
  phase.config.paths.source
);

const writeToManifest = (directory) => {
  return lazypipe()
    .pipe(gulp.dest, getResourceDir('dist', directory))
    .pipe(browserSync.stream, {
      match: '**/*.{js,css}',
    })
    .pipe(rev.manifest, getResourceDir('dist', phase.config.paths.revisionManifest), {
      base: phase.config.paths.dist,
      merge: true,
    })
    .pipe(gulp.dest, phase.config.paths.dist)();
};

/**
 * Task helpers are used to modify a stream in the middle of a task.
 * It allows customization of the stream for automatically created simple tasks
 * (sepha.json -> resource -> dynamicTask:true).
 */

const taskHelpers = {
  styles(outputName) {
    return lazypipe()
      .pipe(() => gulpif(phase.params.maps, sourcemaps.init()))
      .pipe(() => gulpif('*.styl', stylus({
        'include': ['./', './node_modules/'],
        'include css': true
      })))
      .pipe(concat, outputName)
      .pipe(postCSS, [
        autoprefixer({
          browsers: phase.config.supportedBrowsers
        }),
        cssmqpacker(),
        cssnano({
          core: !phase.params.debug,
          discardComments: !phase.params.debug
        }),
      ], {
        map: phase.params.maps
      })
      .pipe(() => gulpif(phase.params.maps, sourcemaps.write('.', {
        sourceRoot: distToAssetPath,
      })))
      ();
  },
  scripts(outputName) {
    return lazypipe()
      .pipe(() => gulpif(phase.params.maps, sourcemaps.init()))
      // Only pipes our main code to rollup/bublé
      .pipe(() => gulpif((file) => {
        return phase.projectGlobs.scripts.some(e => file.path.endsWith(e));
      }, rollup({
        plugins: [
          buble({
            transforms: {
              dangerousForOf: true
            }
          }),
          nodeResolve({
            module: true,
            jsnext: true,
            main: true,
            browser: true,
            extensions: ['.js'],
            preferBuiltins: true
          }),
          commonjs()
        ]
      }, {
        format: 'iife',
      })))
      .pipe(concat, outputName)
      .pipe(() => gulpif(!phase.params.debug, uglify()))
      .pipe(() => gulpif(phase.params.maps, sourcemaps.write('.', {
        sourceRoot: distToAssetPath,
      })))
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

/* Tasks */
gulp.task('jsLinter', (done) => {
  const scriptsDir = getResourceDir('source', 'scripts');
  return gulp.src([
      'gulpfile.*.js',
      j(scriptsDir, '**/*'),
      `!${j(scriptsDir,'vendor/*')}`
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulpif(phase.params.production, jshint.reporter('fail')))
    .on('end', done)
    .on('error', done);
});

gulp.task('uncss', () => {
  const stylesDir = getResourceDir('dist', 'styles');
  const revManifestDir = getResourceDir('dist', phase.config.paths.revisionManifest);

  if (!pathExists(stylesDir)) {
    throw ('Styles distribution directory not found.');
  }

  execSync(`curl -L --silent --output sitemap.json '${phase.config.devUrl}?show_sitemap'`);

  if (!pathExists('./sitemap.json')) {
    throw ('Couldn\'t find the \'sitemap.json\'');
  }

  // Let's get all assets with uncss:true
  const assetsObj = Object.keys(phase.resources.styles.assets).reduce((acc, assetName) => {
    if (phase.resources.styles.assets[assetName].uncss) {
      acc[assetName] = assetName;
    }
    return acc;
  }, {});

  // Does the revision manifest exists?
  if (pathExists(revManifestDir)) {
    // Yes! Let's override the files name
    const revManifest = JSON.parse(readFileSync(revManifestDir, 'utf-8'));
    Object.keys(revManifest).some(item => {
      if (assetsObj[item]) {
        assetsObj[item] = revManifest[item];
      }
    });
  }

  return gulp.src(Object.keys(assetsObj).map(
      key => j(stylesDir, assetsObj[key])
    ), {
      base: './',
    })
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(size({
      showFiles: true,
      showTotal: false,
      title: 'Before unCSS:',
    }))
    .pipe(uncss({
      html: JSON.parse(readFileSync('./sitemap.json', 'utf-8')),
      uncssrc: '.uncssrc'
    }))
    .pipe(size({
      showFiles: true,
      showTotal: false,
      title: 'After unCSS:',
    }))
    .on('end', () => execSync('rm -rf sitemap.json'))
    .on('error', () => execSync('rm -rf sitemap.json'))
    .pipe(gulp.dest('./'));
});

gulp.task('styles', function cssMerger(done) {
  const merged = merge();

  phase.forEachAsset('styles', (asset) => {
    return merged.add(gulp.src(asset.globs, {
        base: phase.resources.styles.directory,
      })
      .pipe(plumber({
        errorHandler: onError
      }))
      .pipe(taskHelpers.styles(asset.outputName))
      .pipe(gulpif(phase.params.production, rev()))
    );
  });

  merged.pipe(writeToManifest(phase.resources.styles.directory))
    .on('end', done)
    .on('error', done);
});

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
      .pipe(gulpif(phase.params.production, rev()))
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
            .pipe(gulp.dest(getResourceDir('dist', resourceInfo.directory, asset.outputName)))
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
      proxy: phase.config.devUrl,
      snippetOptions: {
        whitelist: phase.config.browserSync.whitelist,
        blacklist: phase.config.browserSync.blacklist,
      },
    });
  }

  // Watch based on resource-type-names
  for (const resourceType of Object.keys(phase.resources)) {
    const resourceInfo = phase.resources[resourceType];

    gulp.watch([getResourceDir('source', resourceInfo.directory, '**/*')],
      gulp.series(resourceType)
    );
  }
  gulp.watch(['bower.json', 'sepha.json'], gulp.series('build'));

  done();
});

gulp.task('clean', done => del([phase.config.paths.dist], done));

gulp.task('compile', gulp.parallel(Object.keys(phase.resources)));

gulp.task('build', gulp.series('clean', 'compile'));

gulp.task('default', gulp.series('build'));

const { readFileSync } = require('fs')
const { accessSync } = require('fs')
const { relative: relativePath, join } = require('path')
const { execSync } = require('child_process')
const minimist = require('minimist')
const assetOrchestrator = require('asset-orchestrator')
const browserSyncLib = require('browser-sync')
const concat = require('gulp-concat')
const del = require('del')
const flatten = require('gulp-flatten')
const sourcemaps = require('gulp-sourcemaps')
const gulp = require('gulp')
const gulpif = require('gulp-if')
const imagemin = require('gulp-imagemin')
const eslint = require('gulp-eslint')
const lazypipe = require('lazypipe')
const merge = require('merge-stream')
const plumber = require('gulp-plumber')
const rev = require('gulp-rev')
const stylus = require('gulp-stylus')
const uglify = require('gulp-uglify')
const util = require('gulp-util')
const rollup = require('gulp-better-rollup')
const rollupBuble = require('rollup-plugin-buble')
const rollupNodeResolve = require('rollup-plugin-node-resolve')
const rollupCommonjs = require('rollup-plugin-commonjs')
const postCSS = require('gulp-postcss')
const CSSmqpacker = require('css-mqpacker')
const CSSnano = require('cssnano')
const CSSautoprefixer = require('autoprefixer')
const unCSS = require('gulp-uncss')
const size = require('gulp-size')

// deepExtend by https://gist.github.com/anvk/cf5630fab5cde626d42a
const deepExtend = function (out) {
  out = out || {}

  for (let i = 1, len = arguments.length; i < len; ++i) {
    const obj = arguments[i]

    if (!obj) {
      continue
    }

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue
      }

      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        out[key] = deepExtend(out[key], obj[key])
        continue
      }

      out[key] = obj[key]
    }
  }

  return out
}

const argv = minimist(process.argv.slice(2))
const browserSync = browserSyncLib.create()

// Path to the main manifest file.
const mainManifestPath = './phase.json'
const phase = assetOrchestrator(mainManifestPath)

// Sets configuration default values if needed
phase.config = deepExtend({
  paths: {
    revisionManifest: 'assets.json',
  },
  supportedBrowsers: ['last 2 versions', 'opera 12', 'IE 10'],
  browserSync: {
    files: [],
    whitelist: [],
    blacklist: [],
  },
}, phase.config)

phase.projectGlobs = phase.getProjectGlobs()
phase.params = {
  debug: argv.d, // Do not minify assets when '-d'
  maps: !argv.p, // Create sourcemaps when not in production mode
  production: argv.p, // Production mode, appends hash of file's content to its name
  sync: argv.sync, // Start BroswerSync when '--sync'
}

const onError = function (err) {
  util.beep()
  util.log(err.message)
  this.emit('end')
}

const pathExists = function (path) {
  try {
    accessSync(path)
    return true
  } catch (e) {
    return false
  }
}

const getResourceDir = (folder, type, ...appendix) => {
  return join(phase.config.paths[folder],
    phase.resources[type] ? phase.resources[type].directory : type,
    ...appendix)
}

const distToAssetPath = relativePath(getResourceDir('dist', 'any'), phase.config.paths.source)

// Methods
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
    .pipe(gulp.dest, phase.config.paths.dist)()
}

/**
 * Task helpers are used to modify a stream in the middle of a task.
 * It allows customization of the stream for dynamic tasks
 * (sepha.json -> resource -> dynamicTask:true).
 */

const taskHelpers = {
  styles (outputName) {
    return lazypipe()
      .pipe(() => gulpif(phase.params.maps, sourcemaps.init()))
      .pipe(() => gulpif('*.styl', stylus({
        'include': ['./', './node_modules/'],
        'include css': true,
      })))
      .pipe(concat, outputName)
      .pipe(postCSS, [
        CSSautoprefixer({
          browsers: phase.config.supportedBrowsers,
        }),
        CSSmqpacker(),
        CSSnano({
          core: !phase.params.debug,
          discardComments: !phase.params.debug,
        }),
      ])
      .pipe(() => gulpif(phase.params.maps, sourcemaps.write('.', {
        sourceRoot: distToAssetPath,
      })))()
  },
  scripts (outputName) {
    return lazypipe()
      .pipe(() => gulpif(phase.params.maps, sourcemaps.init()))
      // Only pipes our main code to rollup/bublé
      .pipe(() => gulpif(file => {
        return phase.projectGlobs.scripts.some(e => file.path.endsWith(e) && file.path.indexOf('!') !== 0)
      }, rollup({
        plugins: [
          rollupBuble({
            transforms: {
              dangerousForOf: true,
            },
          }),
          rollupNodeResolve({
            module: true,
            jsnext: true,
            main: true,
            browser: true,
            extensions: ['.js'],
            preferBuiltins: true,
          }),
          rollupCommonjs(),
        ],
      }, {
        format: 'iife',
      })))
      .pipe(concat, outputName)
      .pipe(() => gulpif(!phase.params.debug, uglify()))
      .pipe(() => gulpif(phase.params.maps, sourcemaps.write('.', {
        sourceRoot: distToAssetPath,
      })))()
  },
  fonts () {
    return lazypipe()
      .pipe(flatten)()
  },
  images () {
    return lazypipe()
      .pipe(imagemin, {
        progressive: true,
        interlaced: true,
        svgoPlugins: [{
          removeUnknownsAndDefaults: true,
        }, {
          cleanupIDs: false,
        }],
      })()
  },
}

/* Tasks */
gulp.task('linter', (done) => {
  const scriptsDir = getResourceDir('source', 'scripts')
  return gulp.src([
    'gulpfile.*.js',
    join(scriptsDir, '**/*'),
    `!${join(scriptsDir, 'vendor/*')}`,
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(phase.params.production, eslint.failAfterError()))
    .on('end', done)
    .on('error', done)
})

gulp.task('uncss', () => {
  const stylesDir = getResourceDir('dist', 'styles')
  const revManifestDir = getResourceDir('dist', phase.config.paths.revisionManifest)

  if (!pathExists(stylesDir)) {
    throw new Error('Styles distribution directory not found.')
  }

  try {
    execSync(`curl -L --silent --output sitemap.json '${phase.config.devUrl}?show_sitemap'`)
  } catch (e) {
    throw new Error('Couldn\'t download the sitemap.json')
  }

  if (!pathExists('./sitemap.json')) {
    throw new Error('Couldn\'t find the \'sitemap.json\'')
  }

  // Let's get all assets with uncss:true
  const assetsObj = Object.keys(phase.resources.styles.assets).reduce((acc, assetName) => {
    if (phase.resources.styles.assets[assetName].uncss) {
      acc[assetName] = assetName
    }
    return acc
  }, {})

  // Does the revision manifest exists?
  if (pathExists(revManifestDir)) {
    // Yes! Let's override the files name
    const revManifest = JSON.parse(readFileSync(revManifestDir, 'utf-8'))
    Object.keys(revManifest).some(item => {
      if (assetsObj[item]) {
        assetsObj[item] = revManifest[item]
      }
    })
  }

  return gulp.src(Object.keys(assetsObj).map(
      key => join(stylesDir, assetsObj[key])
    ), {
      base: './',
    })
    .pipe(plumber({
      errorHandler: onError,
    }))
    .pipe(size({
      showFiles: true,
      showTotal: false,
      title: 'Before unCSS:',
    }))
    .pipe(unCSS({
      html: JSON.parse(readFileSync('./sitemap.json', 'utf-8')),
      uncssrc: '.uncssrc',
    }))
    .pipe(size({
      showFiles: true,
      showTotal: false,
      title: 'After unCSS:',
    }))
    .on('end', () => execSync('rm -rf sitemap.json'))
    .on('error', () => execSync('rm -rf sitemap.json'))
    .pipe(gulp.dest('./'))
})

gulp.task('styles', function cssMerger (done) {
  const merged = merge()

  phase.forEachAsset('styles', (asset) => {
    return merged.add(gulp.src(asset.globs, {
      base: phase.resources.styles.directory,
    })
      .pipe(plumber({
        errorHandler: onError,
      }))
      .pipe(taskHelpers.styles(asset.outputName))
      .pipe(gulpif(phase.params.production, rev()))
    )
  })

  merged.pipe(writeToManifest(phase.resources.styles.directory))
    .on('end', done)
    .on('error', done)
})

gulp.task('scripts', gulp.series('linter', function scriptMerger (done) {
  const merged = merge()

  phase.forEachAsset('scripts', (asset) => {
    return merged.add(gulp.src(asset.globs, {
      base: phase.resources.scripts.directory,
    })
      .pipe(plumber({
        errorHandler: onError,
      }))
      .pipe(taskHelpers.scripts(asset.outputName))
      .pipe(gulpif(phase.params.production, rev()))
    )
  })

  merged.pipe(writeToManifest(phase.resources.scripts.directory))
    .on('end', done)
    .on('error', done)
}));

// Automatically creates the 'dynamic tasks'
// when manifest.resources.resourceName.dynamicTask = true
(() => {
  const dynamicTaskHelper = (resourceType, resourceInfo) => {
    return (done) => {
      let counter = 0
      const limit = Object.keys(resourceInfo.assets).length
      const internalDone = () => (++counter === limit) ? done() : 0

      phase.forEachAsset(resourceType, (asset) => {
        gulp.src(asset.globs)
            .pipe(plumber({
              errorHandler: onError,
            }))
            .pipe(gulpif(taskHelpers[resourceType], taskHelpers[resourceType](asset.outputName)))
            .pipe(gulp.dest(getResourceDir('dist', resourceInfo.directory, asset.outputName)))
            .pipe(browserSync.stream({
              match: `**/${resourceInfo.pattern}`,
            }))
            .on('end', internalDone)
            .on('error', internalDone)
            .resume()
      })
    }
  }

  for (const resourceType of Object.keys(phase.resources)) {
    const resourceInfo = phase.resources[resourceType]
    if (resourceInfo.dynamicTask) {
      gulp.task(resourceType, dynamicTaskHelper(resourceType, resourceInfo))
    }
  }
})()

gulp.task('watch', function (done) {
  if (!!phase.config.browserSync && phase.params.sync) {
    browserSync.init({
      files: phase.config.browserSync.files,
      proxy: phase.config.devUrl,
      snippetOptions: {
        whitelist: phase.config.browserSync.whitelist,
        blacklist: phase.config.browserSync.blacklist,
      },
    })
  }

  // Watch based on resource-type-names
  for (const resourceType of Object.keys(phase.resources)) {
    const resourceInfo = phase.resources[resourceType]

    gulp.watch([getResourceDir('source', resourceInfo.directory, '**/*')],
      gulp.series(resourceType)
    )
  }
  gulp.watch(['bower.json', 'sepha.json'], gulp.series('build'))

  done()
})

gulp.task('clean', done => del([phase.config.paths.dist], done))

gulp.task('compile', gulp.parallel(Object.keys(phase.resources)))

gulp.task('build', gulp.series('clean', 'compile'))

gulp.task('default', gulp.series('build'))

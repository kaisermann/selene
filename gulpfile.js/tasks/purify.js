const { readFileSync } = require('fs')
const { join } = require('path')

const gulp = require('gulp')
const plumber = require('gulp-plumber')
const size = require('gulp-size')
const purifyCSS = require('gulp-purifycss')

const pathExists = require('../utils/doesPathExist')
const errorHandler = require('../utils/errorHandler')

const Manifest = require('../Manifest')
const Flags = require('../Flags')

gulp.task('purify', done => {
  const stylesDir = Manifest.getDistDir('styles')

  if (!pathExists(stylesDir)) {
    throw new Error('Styles distribution directory not found.')
  }

  const revManifestPath = join(Manifest.paths.dist, Manifest.paths.manifest)
  const revManifest = pathExists(revManifestPath)
    ? JSON.parse(readFileSync(revManifestPath, 'utf-8'))
    : {}

  // Let's get all assets with purify:true
  const cssPaths = Object.entries(Manifest.resources.styles.assets)
    .filter(([name, asset]) => asset.purify)
    .map(([name, asset]) => join(stylesDir, revManifest[name] || name))

  if (!cssPaths.length) {
    console.log(
      "No css files found with 'purify': true. Define it on the 'Manifest.json'"
    )
    return done()
  }

  const globsToParse = [
    Manifest.getDistDir('scripts', '**', '*.js'),
    join(Manifest.paths.root, 'app', '**', '*.php'),
    join(Manifest.paths.root, '.blade.cache', '**', '*.php'),
    join(Manifest.paths.root, 'resources', '**', '*.php'),
  ]

  return gulp
    .src(cssPaths, { base: './' })
    .pipe(plumber({ errorHandler }))
    .pipe(
      size({ showFiles: true, showTotal: false, title: 'Before purifyCSS:' })
    )
    .pipe(
      purifyCSS(globsToParse, {
        minify: !Flags.debug,
        whitelist: ['js-*', 'wp-*', 'is-*', 'align-*', 'admin-bar*'],
      })
    )
    .pipe(
      size({ showFiles: true, showTotal: false, title: 'After purifyCSS:' })
    )
    .pipe(gulp.dest('./'))
    .on('end', done)
    .on('error', done)
})

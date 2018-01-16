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

const auxSizeReport = msg =>
  size({ showFiles: true, showTotal: false, title: msg })

const distPath = Manifest.config.paths.dist

gulp.task('purify', done => {
  const stylesDir = join(distPath, 'styles')

  if (!pathExists(stylesDir)) {
    throw new Error('Styles distribution directory not found.')
  }

  const revManifestPath = join(distPath, Manifest.config.paths.manifest)
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

  const rootDir = process.cwd()
  const globsToParse = [
    join(distPath, 'scripts', '**', '*.js'),
    join(rootDir, 'app', '**', '*.php'),
    join(rootDir, '.blade.cache', '**', '*.php'),
    join(rootDir, 'resources', '**', '*.php'),
  ]

  return gulp
    .src(cssPaths, { base: './' })
    .pipe(plumber({ errorHandler }))
    .pipe(auxSizeReport('Before purifyCSS:'))
    .pipe(
      purifyCSS(globsToParse, {
        minify: !Flags.debug,
        whitelist: ['js-*', 'wp-*', 'is-*', 'align-*', 'admin-bar*'],
      })
    )
    .pipe(auxSizeReport('After purifyCSS:'))
    .pipe(gulp.dest('./'))
    .on('end', done)
    .on('error', done)
})

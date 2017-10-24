const { readFileSync } = require('fs')
const { join } = require('path')

const gulp = require('gulp')
const plumber = require('gulp-plumber')
const size = require('gulp-size')
const purifyCSS = require('gulp-purifycss')

const crius = require('../manifest')
const getResourceDir = require('../utils/getResourceDir')
const pathExists = require('../utils/doesPathExist')
const onError = require('../utils/onError')

const auxSizeReport = msg =>
  size({ showFiles: true, showTotal: false, title: msg })

const unCSSInternal = done => {
  const stylesDir = getResourceDir('dist', 'styles')

  if (!pathExists(stylesDir)) {
    throw new Error('Styles distribution directory not found.')
  }

  const revManifestDir = getResourceDir(
    'dist',
    crius.config.paths.revisionManifest
  )

  const revManifest = pathExists(revManifestDir)
    ? JSON.parse(readFileSync(revManifestDir, 'utf-8'))
    : {}

  // Let's get all assets with uncss:true
  const cssPaths = Object.entries(crius.resources.styles.assets)
    .filter(([name, asset]) => asset.uncss)
    .map(([name, asset]) => join(stylesDir, revManifest[name] || name))

  const rootDir = process.cwd()

  return gulp
    .src(cssPaths, { base: './' })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(auxSizeReport('Before unCSS:'))
    .pipe(
      purifyCSS(
        [
          getResourceDir('dist', 'scripts', '**', '*.js'),
          join(rootDir, 'app', '**', '*.php'),
          join(rootDir, 'resources', '**', '*.php'),
        ],
        {
          whitelist: ['js-*', 'wp-*', 'is-*', 'align-*', 'admin-bar*'],
        }
      )
    )
    .pipe(auxSizeReport('After unCSS:'))
    .pipe(gulp.dest('./'))
    .on('end', done)
    .on('error', done)
}
unCSSInternal.displayName = 'unCSS > inner task'

gulp.task('uncss', gulp.series('styles', unCSSInternal))

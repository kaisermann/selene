const { readFileSync } = require('fs')
const { join } = require('path')
const { execSync } = require('child_process')

const gulp = require('gulp')
const plumber = require('gulp-plumber')
const size = require('gulp-size')
const postCSS = require('gulp-postcss')
const postCSSuncss = require('postcss-uncss')

const crius = require('../manifest')
const getResourceDir = require('../utils/getResourceDir')
const pathExists = require('../utils/doesPathExist')
const onError = require('../utils/onError')

const auxSizeReport = msg =>
  size({ showFiles: true, showTotal: false, title: msg })

const unCSSInternal = done => {
  const stylesDir = getResourceDir('dist', 'styles')
  const revManifestDir = getResourceDir(
    'dist',
    crius.config.paths.revisionManifest
  )
  const revManifest = pathExists(revManifestDir)
    ? JSON.parse(readFileSync(revManifestDir, 'utf-8'))
    : {}

  if (!pathExists(stylesDir)) {
    throw new Error('Styles distribution directory not found.')
  }

  execSync(
    `curl -L --silent --output sitemap.json '${crius.config.browserSync
      .devUrl}?show_sitemap'`
  )

  if (!pathExists('./sitemap.json')) {
    throw new Error("Couldn't find the 'sitemap.json'")
  }

  // Let's get all assets with uncss:true
  const assetsObj = Object.keys(
    crius.resources.styles.assets
  ).reduce((acc, assetName) => {
    if (crius.resources.styles.assets[assetName].uncss) {
      acc[assetName] = revManifest[assetName] || assetName
    }
    return acc
  }, {})

  const cssPaths = Object.keys(assetsObj).map(key =>
    join(stylesDir, assetsObj[key])
  )

  return gulp
    .src(cssPaths, { base: './' })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(auxSizeReport('Before unCSS:'))
    .pipe(
      postCSS([
        postCSSuncss({
          html: JSON.parse(readFileSync('./sitemap.json', 'utf-8')),
          uncssrc: '.uncssrc',
        }),
      ])
    )
    .pipe(auxSizeReport('Before unCSS:'))
    .pipe(gulp.dest('./'))
    .on('end', done)
    .on('error', done)
}
unCSSInternal.displayName = 'unCSS > inner task'

gulp.task('uncss', gulp.series('styles', unCSSInternal))

const { readFileSync } = require('fs')
const { join } = require('path')

const gulp = require('gulp')
const plumber = require('gulp-plumber')
const size = require('gulp-size')
const uncss = require('gulp-uncss')

const crius = require('../manifest')
const getResourceDir = require('../utils/getResourceDir')
const pathExists = require('../utils/doesPathExist')
const onError = require('../utils/onError')

gulp.task('uncss', done => {
  const stylesDir = getResourceDir('dist', 'styles')
  const revManifestDir = getResourceDir('dist', crius.config.paths.revisionManifest)

  if (!pathExists(stylesDir)) {
    throw new Error('Styles distribution directory not found.')
  }

  if (!pathExists('./sitemap.json')) {
    throw new Error('Couldn\'t find the \'sitemap.json\'')
  }

  // Let's get all assets with uncss:true
  const assetsObj = Object.keys(crius.resources.styles.assets).reduce((acc, assetName) => {
    if (crius.resources.styles.assets[assetName].uncss) {
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
    .pipe(uncss({
      html: JSON.parse(readFileSync('./sitemap.json', 'utf-8')),
      uncssrc: '.uncssrc',
    }))
    .pipe(size({
      showFiles: true,
      showTotal: false,
      title: 'After unCSS:',
    }))
    .pipe(gulp.dest('./'))
    .on('end', done)
    .on('error', done)
})

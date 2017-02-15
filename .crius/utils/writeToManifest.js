const gulp = require('gulp')
const lazypipe = require('lazypipe')
const rev = require('gulp-rev')
const crius = require('../manifest.js')
const getResourceDir = require('./getResourceDir.js')

// Writes production asset to a json manifest
module.exports = function writeToManifest () {
  return lazypipe()
    .pipe(rev.manifest, getResourceDir('dist', crius.config.paths.revisionManifest), {
      base: crius.config.paths.dist,
      merge: true,
    })
    .pipe(gulp.dest, crius.config.paths.dist)
}

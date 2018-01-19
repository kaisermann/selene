const { join } = require('path')
const gulp = require('gulp')
const lazypipe = require('lazypipe')
const rev = require('gulp-rev')

const Manifest = require('../Manifest.js')

/** Writes production asset to a json manifest */
module.exports = () => {
  return lazypipe()
    .pipe(rev.manifest, join(Manifest.paths.dist, Manifest.paths.manifest), {
      base: Manifest.paths.dist,
      merge: true,
    })
    .pipe(gulp.dest, Manifest.paths.dist)
}

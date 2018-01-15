const gulp = require('gulp')
const lazypipe = require('lazypipe')
const rev = require('gulp-rev')
const Manifest = require('../manifest.js')
const { join } = require('path')

/** Writes production asset to a json manifest */
module.exports = () => {
  return lazypipe()
    .pipe(
      rev.manifest,
      join(Manifest.config.paths.dist, Manifest.config.paths.manifest),
      {
        base: Manifest.config.paths.dist,
        merge: true,
      }
    )
    .pipe(gulp.dest, Manifest.config.paths.dist)
}

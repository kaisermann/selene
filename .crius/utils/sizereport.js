const { join } = require('path')
const gulp = require('gulp')
const crius = require('../manifest')
const sizereport = require('gulp-sizereport')

module.exports = function (fileGlob = '') {
  const fn = function (done) {
    gulp.src(join(crius.config.paths.dist, '**', fileGlob))
          .pipe(sizereport({
            gzip: true,
          }))
          .on('end', done)
          .on('error', done)
          .resume()
  }
  fn.displayName = 'size-report'
  return fn
}

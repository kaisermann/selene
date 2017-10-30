const gulp = require('gulp')
const util = require('gulp-util')
const stylint = require('gulp-stylint')
const eslint = require('gulp-eslint')
const gulpIf = require('gulp-if')
const crius = require('../manifest')
const getResourceDir = require('../utils/getResourceDir')

gulp.task('lint:styles', done => {
  const stylesDir = getResourceDir('source', 'styles')
  return gulp
    .src([
      `${stylesDir}/**/*.styl`,
      `!${stylesDir}/common/reboot.styl`,
      `!${stylesDir}/config/mixins.styl`,
    ])
    .pipe(
      stylint({
        reporter: crius.pkg.stylintrc.reporter,
        reporterOptions: crius.pkg.stylintrc.reporterOptions,
        rules: crius.pkg.stylintrc,
      })
    )
    .pipe(stylint.reporter())
    .pipe(crius.params.production ? stylint.reporter('fail') : util.noop())
    .on('end', done)
    .on('error', done)
})

gulp.task('lint:scripts', done => {
  const scriptsDir = getResourceDir('source', 'scripts')
  return gulp
    .src([
      'gulpfile.*.js',
      `${scriptsDir}/**/*.js`,
      `!${scriptsDir}/autoload/*.js`,
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpIf(crius.params.production, eslint.failAfterError()))
    .on('end', done)
    .on('error', done)
})

gulp.task('lint', gulp.parallel('lint:styles', 'lint:scripts'))

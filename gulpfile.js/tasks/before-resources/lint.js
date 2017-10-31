const { join } = require('path')

const gulp = require('gulp')
const { noop } = require('gulp-util')
const stylint = require('gulp-stylint')
const eslint = require('gulp-eslint')

const crius = require('../../manifest')
const params = require('../../params')

gulp.task('lint:styles', done => {
  const stylesDir = join(crius.config.paths.source, 'styles')
  return gulp
    .src([`${stylesDir}/**/*.styl`])
    .pipe(
      stylint({
        reporter: crius.pkg.stylintrc.reporter,
        reporterOptions: crius.pkg.stylintrc.reporterOptions,
        rules: crius.pkg.stylintrc,
      })
    )
    .pipe(stylint.reporter())
    .pipe(params.production ? stylint.reporter('fail') : noop())
    .on('end', done)
    .on('error', done)
})

gulp.task('lint:scripts', done => {
  const scriptsDir = join(crius.config.paths.source, 'scripts')
  return gulp
    .src([
      'gulpfile.*.js',
      `${scriptsDir}/**/*.js`,
      `!${scriptsDir}/autoload/*.js`,
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(params.production ? eslint.failAfterError() : noop())
    .on('end', done)
    .on('error', done)
})

gulp.task('lint', gulp.parallel('lint:styles', 'lint:scripts'))

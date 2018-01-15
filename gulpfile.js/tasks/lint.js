const { join } = require('path')

const gulp = require('gulp')
const stylint = require('gulp-stylint')
const eslint = require('gulp-eslint')

const Manifest = require('../Manifest')
const Flags = require('../Flags')

const noop = require('../utils/noop')

gulp.task('lint:styles', done => {
  const stylesDir = join(Manifest.config.paths.source, 'styles')
  const lintGlobs = [stylesDir]

  return gulp
    .src(lintGlobs.map(path => join(path, '**/*.styl')))
    .pipe(
      stylint({
        reporter: Manifest.pkg.stylintrc.reporter,
        reporterOptions: Manifest.pkg.stylintrc.reporterOptions,
        rules: Manifest.pkg.stylintrc,
      })
    )
    .pipe(stylint.reporter())
    .pipe(Flags.production ? stylint.reporter('fail') : noop())
    .on('end', done)
    .on('error', done)
})

gulp.task('lint:scripts', done => {
  const scriptsDir = join(Manifest.config.paths.source, 'scripts')
  const lintGlobs = [scriptsDir, `!${join(scriptsDir, 'autoload')}`]

  return gulp
    .src(
      lintGlobs.map(path => join(path, '**/*.js')).concat('gulpfile.js/**/*.js')
    )
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(Flags.production ? eslint.failAfterError() : noop())
    .on('end', done)
    .on('error', done)
})

gulp.task('lint', gulp.parallel('lint:styles', 'lint:scripts'))

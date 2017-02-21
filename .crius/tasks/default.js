const del = require('del')
const gulp = require('gulp')
const crius = require('../manifest')
const sizereport = require('../utils/sizereport')

gulp.task('clean', done => del([crius.config.paths.dist], done))

gulp.task('sizereport', sizereport('*'))

gulp.task('compile', gulp.series(gulp.parallel(Object.keys(crius.resources)), 'sizereport'))

gulp.task('build', gulp.series('clean', 'compile'))

gulp.task('default', gulp.series('build'))

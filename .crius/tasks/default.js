const del = require('del')
const gulp = require('gulp')
const crius = require('../manifest')

gulp.task('clean', done => del([crius.config.paths.dist], done))

gulp.task('compile', gulp.parallel(Object.keys(crius.resources)))

gulp.task('build', gulp.series('clean', 'compile'))

gulp.task('default', gulp.series('build'))

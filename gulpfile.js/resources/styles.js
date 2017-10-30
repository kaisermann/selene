const gulp = require('gulp')
const lazypipe = require('lazypipe')
const gulpIf = require('gulp-if')
const concat = require('gulp-concat')
const postcss = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps')
const stylus = require('gulp-stylus')
const rev = require('gulp-rev')
const util = require('gulp-util')

const postCSSautoprefixer = require('autoprefixer')
const postCSSmqpacker = require('css-mqpacker')
const postCSSnano = require('cssnano')

const crius = require('../manifest')
const writeToManifest = require('../utils/writeToManifest')

const stylusOpts = {
  'include css': true,
  use: [require('rupture')(), require('nib')()],
  include: ['./', './node_modules/'],
  import: ['nib/lib/nib/positions'],
}

module.exports = {
  tasks: {
    before: ['lint:styles'],
  },
  pipelines: {
    each: asset => {
      return (
        lazypipe()
          .pipe(() => gulpIf(crius.params.maps, sourcemaps.init()))
          .pipe(() => gulpIf('*.styl', stylus(stylusOpts)))
          // Gulp 4. Appends autoload files to the main stream
          // Only if asset.autoload is defined
          .pipe(
            asset.autoload && asset.autoload.length ? gulp.src : util.noop,
            asset.autoload,
            {
              passthrough: true,
            }
          )
          .pipe(concat, asset.outputName)
          .pipe(postcss, [
            postCSSautoprefixer(),
            postCSSmqpacker(),
            postCSSnano({
              core: !crius.params.debug,
              discardComments: !crius.params.debug,
            }),
          ])
          .pipe(() =>
            gulpIf(
              crius.params.maps,
              sourcemaps.write('.', {
                sourceRoot: crius.config.paths.fromDistToSource,
              })
            )
          )
          .pipe(() => gulpIf(crius.params.production, rev()))
      )
    },
    merged: writeToManifest,
  },
}

const lazypipe = require('lazypipe')
const flatten = require('gulp-flatten')
const newer = require('gulp-newer')
const Manifest = require('../Manifest')

module.exports = {
  pipelines: {
    each: asset => {
      let lazy = lazypipe()

      /** Pass only modified font files to the pipeline */
      lazy = lazy.pipe(newer, Manifest.getDistDir('fonts'))

      /** Flatten the font files to a same directory */
      lazy = lazy.pipe(flatten)

      return lazy
    },
  },
}

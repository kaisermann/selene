const lazypipe = require('lazypipe')
const flatten = require('gulp-flatten')
const newer = require('gulp-newer')
const Resource = require('../Resource')

module.exports = {
  pipelines: {
    each: asset => {
      let lazy = lazypipe()

      lazy = lazy.pipe(newer, Resource.getDistDirectory('fonts'))

      lazy = lazy.pipe(flatten)

      return lazy
    },
  },
}

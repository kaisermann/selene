const lazypipe = require('lazypipe')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const Resource = require('../Resource')

module.exports = {
  pipelines: {
    each: asset => {
      let lazy = lazypipe()

      lazy = lazy.pipe(newer, Resource.getDistDirectory('images'))

      lazy = lazy.pipe(imagemin, [
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            { removeUnknownsAndDefaults: false },
            { cleanupIDs: false },
          ],
        }),
      ])

      return lazy
    },
  },
}

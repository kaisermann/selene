const lazypipe = require('lazypipe')
const imagemin = require('gulp-imagemin')

module.exports = {
  pipelines: {
    each: asset => {
      return lazypipe()
        .pipe(imagemin, {
          progressive: true,
          interlaced: true,
          svgoPlugins: [{
            removeUnknownsAndDefaults: true,
          }, {
            cleanupIDs: false,
          }],
        })
    },
  },
}

const gulp = require('gulp')

const crius = require('../manifest')
const getResourceDir = require('../utils/getResourceDir')

gulp.task('watch', done => {
  if (crius.config.browserSync && crius.params.sync && crius.browserSyncInstance) {
    const browserSyncMode = crius.config.browserSync.mode || null
    let browserSyncOptions = {
      files: crius.config.browserSync.watchFiles,
      notify: false,
      port: 3000,
      snippetOptions: {
        whitelist: crius.config.browserSync.whitelist,
        blacklist: crius.config.browserSync.blacklist,
      },
    }

    if (browserSyncMode === 'server') {
      browserSyncOptions.server = {
        baseDir: ['dist'],
        index: 'index.html',
      }
    } else {
      browserSyncOptions.proxy = crius.config.devUrl
    }
    crius.browserSyncInstance.init(browserSyncOptions)
  }

  // Watch based on resource-type-names
  for (const resourceType of Object.keys(crius.resources)) {
    const resourceInfo = crius.resources[resourceType]
    gulp.watch([getResourceDir('source', resourceInfo.directory, '**/', resourceInfo.pattern)],
      gulp.series(resourceType)
    )
  }
  done()
})

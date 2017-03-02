const { join } = require('path')
const gulp = require('gulp')
const util = require('gulp-util')

const crius = require('../manifest')
const getResourceDir = require('../utils/getResourceDir')

gulp.task('watch', done => {
  const bsConf = crius.config.browserSync

  if (crius.params.sync && crius.browserSyncInstance) {
    if (bsConf) {
      let browserSyncOptions = {
        files: bsConf.watch,
        notify: false,
        port: 3000,
        snippetOptions: {
          whitelist: bsConf.whitelist,
          blacklist: bsConf.blacklist,
        },
      }

      if (bsConf.mode === 'server') {
        console.log(join(process.cwd(), bsConf.baseDir))
        browserSyncOptions.server = {
          // Resolves the path just for showing a complete path on the terminal
          baseDir: join(process.cwd(), bsConf.baseDir),
          index: bsConf.index,
        }
      } else {
        browserSyncOptions.proxy = bsConf.devUrl
      }
      crius.browserSyncInstance.init(browserSyncOptions)
    } else {
      throw new util.PluginError('watch', util.colors.red('Passed "--sync" but no browser-sync configuration was found on "crius.json"'))
    }
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

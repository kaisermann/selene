const { join } = require('path')
const { unlinkSync } = require('fs')
const PluginError = require('plugin-error')
const colors = require('ansi-colors')
const gulp = require('gulp')

const pathExists = require('../utils/doesPathExist')
const params = require('../params')
const crius = require('../manifest')

gulp.task('watch', done => {
  const bsConf = crius.config.browserSync

  if (crius.config.paths.manifest !== undefined) {
    const manifestPath = join(
      crius.config.paths.dist,
      crius.config.paths.manifest
    )

    if (pathExists(manifestPath)) {
      unlinkSync(manifestPath)
    }
  }

  if (params.sync && crius.browserSyncInstance) {
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
        browserSyncOptions.server = {
          /** Absolute path just for showing a complete path on the terminal */
          baseDir: join(crius.config.paths.root, bsConf.baseDir),
          index: bsConf.index,
        }
      } else {
        browserSyncOptions.proxy = bsConf.devUrl
      }
      crius.browserSyncInstance.init(browserSyncOptions)
    } else {
      throw new PluginError(
        'watch',
        colors.red(
          'Passed "--sync" but no browser-sync configuration was found on "crius.json"'
        )
      )
    }
  }

  /** Watch based on resource-type-names */
  for (const [resourceType, resourceInfo] of Object.entries(crius.resources)) {
    const filesToWatch = [
      join(crius.config.paths.components, '**', resourceInfo.pattern),
      join(
        crius.config.paths.source,
        resourceInfo.directory,
        '**',
        resourceInfo.pattern
      ),
      /** watches extra files */
    ].concat(resourceInfo.watch || [])

    gulp.watch(filesToWatch, gulp.series(resourceType))
  }
  done()
})

const { join } = require('path')
const { unlinkSync } = require('fs')
const PluginError = require('plugin-error')
const colors = require('ansi-colors')
const gulp = require('gulp')

const pathExists = require('../utils/doesPathExist')
const Flags = require('../Flags')
const Manifest = require('../Manifest')

gulp.task('watch', done => {
  const bsConf = Manifest.config.browserSync

  if (Manifest.config.paths.manifest !== undefined) {
    const manifestPath = join(
      Manifest.config.paths.dist,
      Manifest.config.paths.manifest
    )

    if (pathExists(manifestPath)) {
      unlinkSync(manifestPath)
    }
  }

  if (Flags.sync && Manifest.browserSyncInstance) {
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
          baseDir: join(Manifest.config.paths.root, bsConf.baseDir),
          index: bsConf.index,
        }
      } else {
        browserSyncOptions.proxy = bsConf.devUrl
      }
      Manifest.browserSyncInstance.init(browserSyncOptions)
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
  for (const [resourceType, resourceInfo] of Object.entries(
    Manifest.resources
  )) {
    const filesToWatch = [
      Manifest.getSourceDir(resourceType, '**', resourceInfo.pattern),
    ]
      /** watches extra files */
      .concat(resourceInfo.watch || [])
    gulp.watch(filesToWatch, gulp.task(resourceType))
  }
  done()
})

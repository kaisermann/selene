const { join } = require('path')
const gulp = require('gulp')
const merge = require('merge-stream')
const plumber = require('gulp-plumber')

const Manifest = require('./Manifest')
const Asset = require('./Asset')

const errorHandler = require('./utils/errorHandler')
const isDir = require('./utils/isDir')
const noop = require('./utils/noop')

const resourcesModules = {}

/** Get a valide resource pipeline or a noop */
const getResourcePipeline = pipeline => (resourceType, ...args) =>
  typeof resourcesModules[resourceType].pipelines[pipeline] === 'function'
    ? resourcesModules[resourceType].pipelines[pipeline](...args)()
    : noop()

const getEachPipeline = getResourcePipeline('each')
const getMergedPipeline = getResourcePipeline('merged')

/** Resource task generator */
const Resource = {
  loadModules () {
    /** Default resource module properties */
    Object.keys(Manifest.resources).forEach(resourceType => {
      let resourceModule
      try {
        resourceModule = require(`./resources/${resourceType}.js`)
      } catch (e) {
        resourceModule = {}
      }

      resourcesModules[resourceType] = {
        tasks: {},
        pipelines: {},
        ...resourceModule,
      }
    })
  },
  getSourceDirectory (resourceType, ...args) {
    return join(Manifest.config.paths.src, resourceType, ...args)
  },
  getDistDirectory (resourceType, ...args) {
    return join(Manifest.config.paths.dist, resourceType, ...args)
  },
  getTasks (resourceType, resourceInfo) {
    return []
      .concat(resourcesModules[resourceType].tasks.before || [])
      .concat(Resource.createTask(resourceType, resourceInfo))
      .concat(resourcesModules[resourceType].tasks.after || [])
  },
  createTask (resourceType, resourceInfo) {
    const innerTaskFn = done => {
      /** Merged object to use on resourceModule.pipelines.merged */
      const merged = merge()

      /** For each asset on the current resource */
      for (const [outputName, assetObj] of Object.entries(
        resourceInfo.assets
      )) {
        /** Reads each resource asset and parses its 'files' property */
        const asset = Asset.buildObj(
          outputName,
          assetObj,
          resourceInfo.directory
        )

        const output = join(
          Manifest.config.paths.dist,
          resourceInfo.directory,
          isDir(outputName) ? outputName : ''
        )

        merged.add(
          gulp
            .src(asset.globs)
            .pipe(plumber({ errorHandler }))
            .pipe(getEachPipeline(resourceType, asset))
            .pipe(gulp.dest(output))
            .pipe(
              Manifest.browserSyncInstance
                ? Manifest.browserSyncInstance.stream({
                  match: `**/${resourceInfo.pattern}`,
                })
                : noop()
            )
        )
      }

      merged
        .pipe(getMergedPipeline(resourceType, resourceInfo))
        .on('end', done)
        .on('error', done)
        .resume()
    }

    /** Sets inner task name for display purposes */
    innerTaskFn.displayName = `${resourceType} > sub-task`
    return innerTaskFn
  },
}

module.exports = Resource

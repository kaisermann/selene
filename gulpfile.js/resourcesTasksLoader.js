const { join } = require('path')
const requireDir = require('require-directory')
const merge = require('merge-stream')

const gulp = require('gulp')
const { noop } = require('gulp-util')
const plumber = require('gulp-plumber')

const errorHandler = require('./utils/errorHandler')
const isDir = require('./utils/isDir')
const sizereport = require('./utils/sizereport')

const crius = require('./manifest')
const params = require('./params')

/** Load resource sub-task modules */
const resMods = requireDir(module, './tasks/resources')
for (const resourceType of Object.keys(crius.resources)) {
  /** Default resource module properties */
  resMods[resourceType] = {
    ...{ tasks: {}, pipelines: {} },
    ...resMods[resourceType],
  }
}

/** RegEx to detect node_modules related paths */
const nodeModulesRegEx = /^(\.|\.\/)?(~|node_modules)/

/** Build the asset object */
const buildAsset = (outputName, baseObj, directory) => {
  let assetObj
  if (typeof baseObj === 'string') {
    assetObj = { files: [baseObj] }
  } else {
    assetObj = baseObj
    if (!assetObj.files) assetObj.files = []
    else if (!Array.isArray(assetObj.files)) {
      assetObj.files = [assetObj.files]
    }
  }
  assetObj.autoload = baseObj.autoload || []
  assetObj.outputName = outputName
  assetObj.globs = assetObj.files.map(
    path =>
      nodeModulesRegEx.test(path)
        ? path.replace(nodeModulesRegEx, './node_modules')
        : join(crius.config.paths.source, directory, path)
  )
  return assetObj
}

/** Get a valide resource pipeline or a noop */
const resourcePipeline = (pipeline, resourceType, ...args) =>
  typeof resMods[resourceType].pipelines[pipeline] === 'function'
    ? resMods[resourceType].pipelines[pipeline](...args)()
    : noop()

/** Resource sub-task creator */
const resourceSubtask = (resourceType, resourceInfo) => {
  const innerTaskFn = done => {
    /** Merged object to use on resourceModule.pipelines.merged */
    const merged = merge()
    const assets = crius.resources[resourceType].assets

    /** For each asset on the current resource */
    for (const [outputName, assetObj] of Object.entries(assets)) {
      /** Reads each resource asset and parses its 'files' property */
      const asset = buildAsset(outputName, assetObj, resourceInfo.directory)
      const output = join(
        crius.config.paths.dist,
        resourceInfo.directory,
        isDir(outputName) ? outputName : ''
      )

      merged.add(
        gulp
          .src(asset.globs)
          .pipe(plumber({ errorHandler }))
          .pipe(resourcePipeline('each', resourceType, asset))
          .pipe(gulp.dest(output))
          .pipe(
            crius.browserSyncInstance
              ? crius.browserSyncInstance.stream({
                match: `**/${resourceInfo.pattern}`,
              })
              : noop()
          )
      )
    }

    merged
      .pipe(resourcePipeline('merged', resourceType, resourceInfo))
      .on('end', done)
      .on('error', done)
      .resume()
  }

  /** Sets inner task name for display purposes */
  innerTaskFn.displayName = `${resourceType} > sub-task`
  return innerTaskFn
}

/** Automatically create the resources tasks */
const shouldReportSizes = params.report && process.argv.includes('watch')
for (const [resourceType, resourceInfo] of Object.entries(crius.resources)) {
  /** Pushes the resource task and its dependencies  */
  const taskQueue = []
    .concat(resMods[resourceType].tasks['before'] || [])
    .concat(resourceSubtask(resourceType, resourceInfo))
    .concat(resMods[resourceType].tasks['after'] || [])
    .concat(
      shouldReportSizes || process.argv.includes(resourceType)
        ? sizereport(resourceInfo.pattern)
        : []
    )

  /** If we have no dependency tasks, pass only the resource task and not a task series */
  gulp.task(
    resourceType,
    taskQueue.length === 1 ? taskQueue[0] : gulp.series(taskQueue)
  )
}

const { join } = require('path')
const requireDir = require('require-directory')
const merge = require('merge-stream')

const gulp = require('gulp')
const util = require('gulp-util')
const plumber = require('gulp-plumber')

const crius = require('./manifest')
const getResourceDir = require('./utils/getResourceDir')
const onError = require('./utils/onError')
const isDir = require('./utils/isDir')
const sizereport = require('./utils/sizereport')

// Loads resource inner task modules
const resourceModules = requireDir(module, './resource-modules')

// Gets the specified resource's pipeline
const getResourcePipeline = (resourceType, whichPipeline, ...args) => {
  const resMod = resourceModules[resourceType]
  if (resMod && typeof resMod.pipelines[whichPipeline] === 'function') {
    return resMod.pipelines[whichPipeline](...args)()
  }
  return util.noop()
}

const buildAssetObj = (outputName, preObj) => {
  let assetObj = {}

  if ('' + preObj === preObj) {
    assetObj.files = [preObj]
  } else {
    assetObj = preObj
    if (!assetObj.files) assetObj.files = []
    else if (!Array.isArray(assetObj.files)) {
      assetObj.files = [assetObj.files]
    }
  }
  assetObj.vendor = assetObj.vendor || []
  assetObj.outputName = outputName
  assetObj.globs = assetObj.files.map(path =>
    join(crius.config.paths.source, path)
  )
  return assetObj
}

// Helper to create resources tasks
const dynamicTaskHelper = (resourceType, resourceInfo) => {
  const innerTaskFn = done => {
    // Merged object to use on resourceModule.pipelines.merged
    const merged = merge()
    const curAssets = crius.resources[resourceType].assets

    // For each asset on the current resource
    Object.keys(curAssets).forEach(outputName => {
      // Reads each resource asset and parses its 'files' property
      const curAsset = buildAssetObj(outputName, curAssets[outputName])
      const output = getResourceDir(
        'dist',
        resourceInfo.directory,
        isDir(outputName) ? outputName : ''
      )

      merged.add(
        gulp
          .src(curAsset.globs)
          .pipe(plumber({ errorHandler: onError }))
          .pipe(getResourcePipeline(resourceType, 'each', curAsset))
          .pipe(gulp.dest(output))
          .pipe(
            crius.browserSyncInstance
              ? crius.browserSyncInstance.stream({
                match: `**/${resourceInfo.pattern}`,
              })
              : util.noop()
          )
      )
    })
    merged
      .pipe(getResourcePipeline(resourceType, 'merged', resourceInfo))
      .on('end', done)
      .on('error', done)
      .resume()
  }

  // Sets inner task name for display purposes
  innerTaskFn.displayName = `${resourceType} > inner task`
  return innerTaskFn
}

// Appends tasks to a task array
const appendAuxTasks = (key, module, queue) => {
  if (!module) return queue
  let depTasks = module[key] || []
  if (!Array.isArray(depTasks)) {
    depTasks = [depTasks]
  }
  return queue.concat(depTasks)
}

// Automatically creates resources tasks
for (const resourceType of Object.keys(crius.resources)) {
  const resourceInfo = crius.resources[resourceType]
  const resourceModule = resourceModules[resourceType]
  let taskQueue = []

  // Checks if a resource task have any tasks to run before itself
  taskQueue = appendAuxTasks('preTasks', resourceModule, taskQueue)

  // Pushes the resource task
  taskQueue.push(dynamicTaskHelper(resourceType, resourceInfo))

  // Checks if a resource task have any tasks to run after itself
  taskQueue = appendAuxTasks('postTasks', resourceModule, taskQueue)

  // When '--report' is set, are we doing a resource task or the watch task?
  // If yes, let's append the Report task to the pipeline
  // If not, is it a resource task called by the CLI?
  if (
    (crius.params.report && process.argv.includes('watch')) ||
    process.argv.includes(resourceType)
  ) {
    taskQueue.push(sizereport(resourceInfo.pattern))
  }

  // If we have no dependency tasks, pass only the resource task and not a task series
  gulp.task(
    resourceType,
    taskQueue.length === 1 ? taskQueue[0] : gulp.series(taskQueue)
  )
}

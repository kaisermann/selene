const { resolve } = require('path')
const { readdirSync } = require('fs')
const gulp = require('gulp')

const sizereport = require('./utils/sizereport')

const Resource = require('./Resource')
const Manifest = require('./Manifest')
const Flags = require('./Flags')

/** Default NODE_ENV to 'dev' if not set */
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

/** Load all but the 'main' gulp tasks */
const tasksPath = resolve(Manifest.config.paths.root, 'gulpfile.js', 'tasks')
readdirSync(tasksPath).forEach(fileName => {
  if (fileName !== 'main.js') {
    require(resolve(tasksPath, fileName))
  }
})

/** Load resources modules */
Resource.loadModules()

/** Automatically create the resources tasks */
const maybeReportSizes = Flags.report && process.argv.includes('watch')
for (const [resourceType, resourceInfo] of Object.entries(Manifest.resources)) {
  /** Pushes the resource task and its dependencies  */
  const taskQueue = Resource.getTasks(resourceType, resourceInfo)

  if (maybeReportSizes || process.argv.includes(resourceType)) {
    taskQueue.push(sizereport(resourceInfo.pattern))
  }

  gulp.task(resourceType, gulp.series(taskQueue))
}

/** Finally, load the main default tasks */
require('./tasks/main.js')

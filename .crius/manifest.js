const { relative, join } = require('path')
const browserSyncLib = require('browser-sync')
const assetOrchestrator = require('asset-orchestrator')
const deepExtend = require('deep-extend')

const params = require('./params')

// Path to the main manifest file.
const mainManifestPath = './crius.json'

// Loads the crius manifest
const crius = assetOrchestrator(mainManifestPath)

// Default path values
crius.config.paths = deepExtend({
  source: 'app/',
  dist: 'dist/',
}, crius.config.paths)

// Default values for the `config` object
crius.config = deepExtend({
  paths: {
    revisionManifest: 'assets.json',
    fromDistToSource: relative(
      join(crius.config.paths.dist, 'any'), crius.config.paths.source
    ),
  },
}, crius.config)

// Default browserSync configuration
if (crius.config.browserSync) {
  crius.config.browserSync = deepExtend({
    mode: 'proxy',
    index: 'index.html',
    baseDir: crius.config.paths.dist,
    watchFiles: [],
    whitelist: [],
    blacklist: [],
  }, crius.config.browserSync)
}

// Default values for each 'resource' entry
for (const resourceType of Object.keys(crius.resources)) {
  const resourceInfo = crius.resources[resourceType]
  crius.resources[resourceType] = deepExtend({
    directory: resourceType,
  }, resourceInfo)
}

// Parses passed parameters
crius.params = params

// Creates a broswersync instance
if (crius.params.sync) {
  crius.browserSyncInstance = browserSyncLib.create()
}

module.exports = crius

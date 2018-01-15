const { readFileSync } = require('fs')
const { relative, join } = require('path')

const Flags = require('./Flags')
const browserSync = require('browser-sync')

/** Load the crius manifest */
const Manifest = JSON.parse(readFileSync('./crius.json', 'utf8'))

/** Default path values */
Manifest.config.paths = {
  source: 'app/',
  dist: 'dist/',
  manifest: 'assets.json',
  root: process.cwd(),
  ...Manifest.config.paths,
}

Manifest.config.paths.distToRoot = relative(
  join(Manifest.config.paths.dist, 'resource'),
  Manifest.config.paths.root
)

/** Project's package.json content (used for getting stylint config) */
Manifest.pkg = require(join(Manifest.config.paths.root, 'package.json'))

/** Default browserSync configuration */
if (Manifest.config.browserSync) {
  Manifest.config.browserSync = {
    mode: 'proxy',
    index: 'index.html',
    baseDir: './',
    watchFiles: [],
    whitelist: [],
    blacklist: [],
    ...Manifest.config.browserSync,
  }
}

/** Default values for each 'resource' entry */
for (const [resourceType, resourceInfo] of Object.entries(Manifest.resources)) {
  Manifest.resources[resourceType] = {
    directory: resourceType,
    ...resourceInfo,
  }
}

/** Create a browsersync instance if '--sync' was passed */
if (Flags.sync) {
  Manifest.browserSyncInstance = browserSync.create()
}

module.exports = Manifest

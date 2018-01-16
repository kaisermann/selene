/** Returns a asset object */
const { join } = require('path')
const Manifest = require('./Manifest')

const nodeModulesRegEx = /^(\.|\.\/)?(~|node_modules)/

module.exports = {
  buildObj (outputName, baseObj, directory) {
    let assetObj =
      baseObj.constructor === Object
        ? { ...baseObj, files: [].concat(baseObj.files || []) }
        : { files: [].concat(baseObj) }

    return {
      ...assetObj,
      outputName,
      autoload: baseObj.autoload || [],
      globs: assetObj.files.map(
        path =>
          nodeModulesRegEx.test(path)
            ? path.replace(nodeModulesRegEx, './node_modules')
            : join(Manifest.config.paths.source, directory, path)
      ),
    }
  },
}

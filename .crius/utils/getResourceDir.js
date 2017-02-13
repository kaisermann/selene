const { join } = require('path')

const crius = require('../manifest')

module.exports = function getResourceDir (folder, type, ...appendix) {
  return join(crius.config.paths[folder],
    crius.resources[type] ? crius.resources[type].directory : type,
    ...appendix)
}

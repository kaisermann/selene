const { accessSync } = require('fs')

module.exports = function (path) {
  try {
    accessSync(path)
    return true
  } catch (e) {
    return false
  }
}

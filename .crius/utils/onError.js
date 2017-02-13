const util = require('gulp-util')

module.exports = function (err) {
  util.beep()
  util.log(err.message)
  this.emit('end')
}

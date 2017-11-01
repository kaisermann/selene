const { relative, basename } = require('path')
const through2 = require('through2')
const rollup = require('rollup')

const params = require('../../params')
const crius = require('../../manifest')

const plugins = require('./plugins')

/**
 * Return a pipeable method that uses the current
 * gulp stream of files as the input for Rollup
 */
module.exports = () =>
  through2.obj(async (file, enc, next) => {
    const opts = {
      input: file.path,
      sourcemap: params.maps,
      format: 'iife',
      plugins,
    }

    if (file.isNull()) return next(null, file)

    const bundle = await rollup.rollup(opts)
    const { code, map } = await bundle.generate(opts)

    if (map) {
      map.file = relative(crius.config.paths.root, file.path)
      map.sources = map.sources.map(
        source =>
          source === file.path
            ? basename(file.path)
            : relative(file.path, source)
      )
      file.sourceMap = map
    }
    file.contents = Buffer.from(code)
    next(null, file)
  })

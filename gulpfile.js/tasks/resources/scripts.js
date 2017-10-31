const { join } = require('path')

const gulp = require('gulp')
const lazypipe = require('lazypipe')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const betterRollup = require('gulp-better-rollup')
const rev = require('gulp-rev')

const rollUpAlias = require('rollup-plugin-alias')
const rollUpBuble = require('rollup-plugin-buble')
const rollUpCommonjs = require('rollup-plugin-commonjs')
const rollUpNodeResolve = require('rollup-plugin-node-resolve')
const rollUpNodebuiltins = require('rollup-plugin-node-builtins')
const rollUpSizes = require('rollup-plugin-sizes')

const crius = require('../../manifest')
const params = require('../../params')

const writeToManifest = require('../../utils/writeToManifest')

const rollUpPlugins = [
  /** Javascript import paths aliases */
  rollUpAlias({
    '@Components': crius.config.paths.components,
    '@Scripts': join(crius.config.paths.source, 'scripts'),
  }),
  /** Allow to import node builtin modules such as path, url, querystring, etc */
  rollUpNodebuiltins(),
  /** Allow to import modules from the `node_modules` */
  rollUpNodeResolve({
    module: true,
    jsnext: true,
    main: true,
    browser: true,
    extensions: ['.js'],
    preferBuiltins: true,
  }),
  /** Transforms CommonJS modules into ES6 modules for RollUp */
  rollUpCommonjs(),
  /** Transpiles the code, ignoring coniguration from the `node_modules` */
  rollUpBuble({
    transforms: {
      arrow: true,
      dangerousForOf: true,
    },
  }),
]

if (params.report) {
  rollUpPlugins.push(rollUpSizes())
}

module.exports = {
  tasks: {
    before: ['lint:scripts'],
  },
  pipelines: {
    each: asset => {
      let lazy = lazypipe()

      /** Initialize sourcemaps */
      if (params.maps) {
        lazy = lazy.pipe(sourcemaps.init)
      }

      /** Bundle the js files */
      lazy = lazy.pipe(
        betterRollup,
        { plugins: rollUpPlugins },
        { format: 'iife' }
      )

      /** Passthrough autoload files (Gulp 4) */
      if (asset.autoload && asset.autoload.length) {
        lazy = lazy.pipe(gulp.src, asset.autoload, { passthrough: true })
      }

      /** Concatenate all read files */
      lazy = lazy.pipe(concat, asset.outputName)

      /** Uglify if not debugging (-d) */
      if (!params.debug) {
        lazy = lazy.pipe(uglify)
      }

      /** Write the sourcemaps */
      if (params.maps) {
        lazy = lazy.pipe(sourcemaps.write, '.', {
          sourceRoot: crius.config.paths.distToRoot,
        })
      }

      /** If production, create cache-busting files */
      if (params.production) {
        lazy = lazy.pipe(rev)
      }

      return lazy
    },
    merged: writeToManifest,
  },
}

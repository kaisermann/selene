const { join } = require('path')
const gulp = require('gulp')
const lazypipe = require('lazypipe')
const gulpIf = require('gulp-if')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const betterRollup = require('gulp-better-rollup')
const rev = require('gulp-rev')
const util = require('gulp-util')

// const rollUpBabel = require('rollup-plugin-babel')
const rollUpAlias = require('rollup-plugin-alias')
const rollUpBuble = require('rollup-plugin-buble')
const rollUpCommonjs = require('rollup-plugin-commonjs')
const rollUpNodeResolve = require('rollup-plugin-node-resolve')
const rollUpNodebuiltins = require('rollup-plugin-node-builtins')
const rollUpSizes = require('rollup-plugin-sizes')

const crius = require('../manifest')
const writeToManifest = require('../utils/writeToManifest')

const rollUpPlugins = [
  // Generates the components alias object
  // Used for import calls
  // Ex: import Header from 'Components/Header'
  rollUpAlias({
    '@Components': crius.config.paths.components,
    '@Scripts': join(crius.config.paths.source, 'scripts'),
  }),
  // Allow to import node builtin modules such as path, url, querystring, etc
  rollUpNodebuiltins(),
  // Allow to import modules from the `node_modules`
  rollUpNodeResolve({
    module: true,
    jsnext: true,
    main: true,
    browser: true,
    extensions: ['.js'],
    preferBuiltins: true,
  }),
  // Transforms CommonJS modules into ES6 modules for RollUp
  rollUpCommonjs(),
  // Transpiles the code, ignoring coniguration from the `node_modules`
  rollUpBuble({
    transforms: {
      arrow: true,
      dangerousForOf: true,
    },
  }),
]

if (crius.params.report) {
  rollUpPlugins.push(rollUpSizes())
}

module.exports = {
  tasks: {
    before: ['eslint'],
  },
  pipelines: {
    each: asset => {
      return (
        lazypipe()
          .pipe(() => gulpIf(crius.params.maps, sourcemaps.init()))
          .pipe(betterRollup, { plugins: rollUpPlugins }, { format: 'iife' })
          // Gulp 4. Appends vendor files to the main stream
          // Only if asset.vendor is defined
          .pipe(
            asset.vendor && asset.vendor.length ? gulp.src : util.noop,
            asset.vendor,
            { passthrough: true }
          )
          .pipe(concat, asset.outputName)
          .pipe(() => gulpIf(!crius.params.debug, uglify()))
          .pipe(() =>
            gulpIf(
              crius.params.maps,
              sourcemaps.write('.', {
                sourceRoot: crius.config.paths.fromDistToSource,
              })
            )
          )
          .pipe(() => gulpIf(crius.params.production, rev()))
      )
    },
    merged: writeToManifest,
  },
}

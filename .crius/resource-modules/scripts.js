const { readdirSync, statSync } = require('fs')
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
const rollUpAlias = require('rollup-plugin-strict-alias')
const rollUpBuble = require('rollup-plugin-buble')
const rollUpCommonjs = require('rollup-plugin-commonjs')
const rollUpNodeResolve = require('rollup-plugin-node-resolve')
const rollUpNodebuiltins = require('rollup-plugin-node-builtins')

const crius = require('../manifest')
const writeToManifest = require('../utils/writeToManifest')

// Searches recursively for directories
function getDirs (dir, filenamesAcc = []) {
  return readdirSync(dir).reduce((list, dirName) => {
    const realPath = join(dir, dirName)
    if (statSync(realPath).isDirectory()) {
      filenamesAcc.push(dirName)
      list.push(filenamesAcc)
      list = list.concat(getDirs(realPath, filenamesAcc.slice(0)))
      filenamesAcc = []
    }
    return list
  }, [])
}

module.exports = {
  preTasks: ['eslint'],
  pipelines: {
    each: asset => {
      return (
        lazypipe()
          .pipe(() => gulpIf(crius.params.maps, sourcemaps.init()))
          .pipe(
            betterRollup,
          {
            plugins: [
              // Generates the components alias object
              // Used for import calls
              // Ex: import Header from 'Components/Header'
              rollUpAlias(
                  getDirs(crius.config.paths.components).reduce(
                    (obj, acc) => {
                      const alias = ['@Components', ...acc].join('/')
                      // '@Components/ComponentName...'
                      obj[alias] = join(
                        crius.config.paths.components, // Components directory
                        acc.join('/'), // File path inside componenets directory
                        acc[acc.length - 1] + '.js' // File name
                      )
                      return obj
                    },
                    {
                      '@Components/Base': join(
                        crius.config.paths.components,
                        'Base.js'
                      ),
                    }
                  )
                ),
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
                // rollUpBabel({
                //  exclude: 'node_modules/**/.babelrc',
                // }),
            ],
          },
          {
            format: 'iife',
          }
          )
          // Gulp 4. Appends vendor files to the main stream
          // Only if asset.vendor is defined
          .pipe(asset.vendor.length ? gulp.src : util.noop, asset.vendor, {
            passthrough: true,
          })
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

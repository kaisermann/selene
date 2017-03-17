const lazypipe = require('lazypipe')
const gulpIf = require('gulp-if')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const betterRollup = require('gulp-better-rollup')
const rev = require('gulp-rev')

// const rollUpBabel = require('rollup-plugin-babel')
const rollUpBuble = require('rollup-plugin-buble')
const rollUpCommonjs = require('rollup-plugin-commonjs')
const rollUpNodeResolve = require('rollup-plugin-node-resolve')
const rollUpNodebuiltins = require('rollup-plugin-node-builtins')

const crius = require('../manifest')
const writeToManifest = require('../utils/writeToManifest')

// Caches the project's globs
const projectGlobs = crius.getProjectGlobs()

module.exports = {
  dependencyTasks: ['linter'],
  pipelines: {
    each: asset => {
      return lazypipe()
        .pipe(() => gulpIf(crius.params.maps, sourcemaps.init()))
        // Only pipes our main code to rollup/babel
        .pipe(() => gulpIf(file => {
          return projectGlobs.scripts.some(e => file.path.endsWith(e) && file.path.indexOf('!') !== 0)
        }, betterRollup({
          plugins: [
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
        }, {
          format: 'iife',
        })))
        .pipe(concat, asset.outputName)
        .pipe(() => gulpIf(!crius.params.debug, uglify()))
        .pipe(() => gulpIf(crius.params.maps, sourcemaps.write('.', {
          sourceRoot: crius.config.paths.fromDistToSource,
        })))
        .pipe(() => gulpIf(crius.params.production, rev()))
    },
    merged: writeToManifest,
  },
}

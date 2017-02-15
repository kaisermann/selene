const lazypipe = require('lazypipe')
const gulpIf = require('gulp-if')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const betterRollup = require('gulp-better-rollup')
const rev = require('gulp-rev')

const rollUpBabel = require('rollup-plugin-babel')
const rollUpCommonjs = require('rollup-plugin-commonjs')
const rollUpNodeResolve = require('rollup-plugin-node-resolve')

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
            rollUpNodeResolve({
              module: true,
              jsnext: true,
              main: true,
              browser: true,
              extensions: ['.js'],
              preferBuiltins: true,
            }),
            rollUpCommonjs(),
            rollUpBabel(),
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

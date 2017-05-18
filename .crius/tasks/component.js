const { join } = require('path')
const fs = require('fs')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const gulp = require('gulp')

const JS_CONTENT = `import aph from 'aph'
import Component from 'Components.Base'
 
export default class %camelizedName% extends Component {

}

%camelizedName%.seek = () => aph('.js-%lowerName%').each(element => new %camelizedName%(element))
`

const BLADE_CONTENT = `<div class="%lowerName% js-%lowerName%">

</div>`

const capitalizeStr = str => str[0].toUpperCase() + str.slice(1)

const semiCamelize = str =>
  `${str.charAt(0)}${str
    .replace(/[\W_]/g, '|')
    .split('|')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('')
    .slice(1)}`

const fillComponentName = (content, name) =>
  content
    .replace(/%name%/g, name)
    .replace(/%lowerName%/g, name.toLowerCase())
    .replace(/%camelizedName%/g, semiCamelize(name))

gulp.task('component', done => {
  const args = process.argv.slice(3)

  let componentName = capitalizeStr(args[1])
  let fileName = semiCamelize(componentName)
  let componentPath = join(
    process.cwd(),
    `resources/views/components/${fileName}`
  )

  if (!args[0]) throw new Error('Missing first parameter')

  switch (args[0].slice(2)) {
    case 'create':
      mkdirp(componentPath, err => {
        if (err) return done(err)

        fs.writeFile(join(componentPath, fileName + '.styl'), '', () =>
          fs.writeFile(
            join(componentPath, fileName + '.blade.php'),
            fillComponentName(BLADE_CONTENT, componentName),
            () =>
              fs.writeFile(
                join(componentPath, fileName + '.js'),
                fillComponentName(JS_CONTENT, componentName),
                done
              )
          )
        )
      })
      break

    case 'delete':
      rimraf(componentPath, done)
      break

    default:
      throw new Error('Invalid parameter. ')
  }
})

const { join } = require('path')
const fs = require('fs')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const gulp = require('gulp')

const JS_CONTENT = `import aph from 'aph'
import Component from 'Components/Base'

export default class %camelizedName% extends Component {

}

%camelizedName%.seek = () => aph('.js-%lowerName%').each(element => new %camelizedName%(element))
`

const BLADE_CONTENT = `<div class="%lowerName% js-%lowerName%">

</div>`

const CSS_CONTENT = `// .%lowerName%
`

const FILE_TEMPLATES = [
  ['styl', CSS_CONTENT],
  ['blade.php', BLADE_CONTENT],
  ['js', JS_CONTENT],
]

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
  const promiseQueue = []
  const componentsToManage = args[1].split(',')

  componentsToManage.forEach(tmpComponentName => {
    let realComponentName = capitalizeStr(tmpComponentName)
    let fileName = semiCamelize(realComponentName)
    let componentPath = join(
      process.cwd(),
      `resources/views/components/${fileName}`
    )

    if (!args[0]) throw new Error('Missing first parameter')

    switch (args[0].slice(2)) {
      case 'create':
        // Creates the component directory
        mkdirp.sync(componentPath)

        // Creates the .styl, .js and .blade.php files
        FILE_TEMPLATES.forEach(resTemplate => {
          promiseQueue.push(
            new Promise((resolve, reject) => {
              fs.writeFile(
                join(componentPath, `${fileName}.${resTemplate[0]}`),
                fillComponentName(resTemplate[1], realComponentName),
                resolve
              )
            })
          )
        })
        break

      case 'delete':
        promiseQueue.push(
          new Promise((resolve, reject) => rimraf(componentPath, resolve))
        )
        break

      default:
        throw new Error('Invalid parameter. ')
    }
  })
  Promise.all(promiseQueue).then(() => done())
})

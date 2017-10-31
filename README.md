# Crius

> A flexible and modular gulp front-end workflow based on the (awesome) [Sage starter theme](https://github.com/roots/sage).

With crius you can:

- Write CSS with Stylus
  - Build your website's grid with the RolleiFLEX declarative flex helper framework. (stylus)
  - Use simplified media queries with rupture (stylus)
  - Responsive font-size and [other useful mixins](https://github.com/kaisermann/crius/blob/master/assets/styles/config/mixins.styl)
- Write modern Javascript
- See live changes (CSS/JS/HTML) on your project with [browserSync](https://www.browsersync.io/)
- Need to manage a new type of resource, like, let's say... sounds? Just define it in the [`crius.json`](https://github.com/kaisermann/crius/blob/master/crius.json) and let the magic happen!

## Requirements

- [Node.js](http://nodejs.org/) >= 7.x.x
- [Gulp](https://www.liquidlight.co.uk/blog/article/how-do-i-update-to-gulp-4/) >= 4.x.x

## Installation

1. `git clone git@github.com:kaisermann/crius.git`
1. `npm install` or `yarn`
1. Run at least `gulp build` before running `gulp watch`

## Usage samples

- [Selene](https://github.com/kaisermann/selene) - Wordpress theme based on [Sage](https://github.com/roots/sage) and Crius.
- [Hyperion](https://github.com/kaisermann/hyperion) - A static web-app workflow based on Crius.

## Theme Development

### Build commands

Pretty much every task needed is covered by the `package.json` scripts:

- `npm run watch|start` - Run browsersync and watch file changes;
- `npm run build` - Build minified assets;
- `npm run build:dev` - Build unminified assets;
- `npm run build:production` - Build the assets, append a hash to the name;
- `npm run clean` - Remove the `dist` folder;
- `npm run lint` - Lint all `styl` and `js` files;
- `npm run lint:styles` - Lint all `styl` files;
- `npm run lint:scripts` - Lint all `js` files.

### Gulp

- `gulp` / `gulp build` - Erases distribution directory and builds all assets
- `gulp compile` - Same as `gulp build` - without deleting distribution directory
- `gulp clean` - Deletes the distribution directory
- `gulp watch` - Starts watching the asset files
- `gulp sizereport` - Displays the size and gzipped size of your project
- `gulp scripts` - Build 'scripts';
- `gulp styles` - Build 'styles';
- `gulp fonts` - Build 'fonts';
- `gulp images` - Build 'images';
- `gulp lint` - Lint all `styl` and `js` files;
- `gulp lint:styles` - Lint all `styl` files;
- `gulp lint:scripts` - Lint all `js` files.

#### Creating new tasks

To create new generic gulp tasks, just create a file inside `gulpfile.js/tasks`, import `gulp` and create a task as if it was inside the gulpfile itself.

All tasks defined on the mentioned directory are imported BEFORE the resource tasks. If it's needed to load them AFTER the resource tasks, you can define a 'later-loading' queue at the beginning of the [`gulpfile.js`](https://github.com/kaisermann/crius/blob/master/gulpfile.js). For an example, check the [`loadLater`](https://github.com/kaisermann/crius/blob/master/gulpfile.js/index.js#L6) constant which already delays the loading of `default.js`.

#### Gulp Parameters

You can also pass the following parameters to gulp:

- `--sync` Starts browserSync. Use only with `gulp watch`
- `--report` or `-r` Report mode
  - If used with `watch`, it will display the assets sizes of the current resource being edited
- `--maps` Allows sourcemaps to be created
- `-d` Asset debug mode. It won't minify the files
- `-p` Production mode. File names will be appended with a hash of its content for cache-busting

The available parameters can be extended at [`gulpfile.js/params.js`](https://github.com/kaisermann/crius/blob/master/gulpfile.js/params.js).

### Supported browsers

The supported browsers for CSS autoprefixing, eslint-compat plugin, etc can be configured by editing the `browserslist` array inside the [`package.json`](https://github.com/kaisermann/crius/blob/master/package.json).

## Manifest (`crius.json`) Documentation

### The `config` object

The [`config.paths`](https://github.com/kaisermann/crius/blob/master/crius.json#L3) object MAY have a `manifest` **string** attribute that defines the revision manifest's file name on production distributions.

Defaults to `"assets.json"`

--------------------------------------------------------------------------------

The `config` object MUST have a `browserSync` **object** if it's planned to use browserSync.

```json
{
  "config": {
    "browserSync": {
      "mode": "proxy",
      "baseDir": "./",
      "index": "index.html",
      "devUrl":"localhost/crius",
      "watch": [
        "{lib,templates}/**/*.{php,html}",
        "*.{php,html}"
      ],
      "whitelist": [],
      "blacklist": []
    }
  }
}
```

`watch` is an **optional** **array** or a `string` of files to be watched by browserSync. **Do not** watch your asset files via browserSync as they are already being watched by `gulp.watch`. Defaults to `[]`.

`whitelist` and `blacklist` are each one an **optional** **array** or a `string` of supposed watched files allowed/not allowed to be watched. Defaults to `[]`.

`mode` is a **optional** `string` that defines in which mode should browserSync be initialized.

- In `server` mode, it creates a temporary server for your project.

- In `proxy` mode (default), it just proxies the `devUrl` to an already existing server.

With `mode: "proxy"`

- `devUrl` is a **mandatory** `string` that specifies your projects development proxy url.

With `mode: "server"`

- `baseDir` is a **optional** `string` that defines the root directory for the browserSync server (defaults to the gulpfile directory).

- `index` is a **optional** `string`that defines the entry file for the browserSync server (defaults to `index.html`)

--------------------------------------------------------------------------------

### The `resources` object

```json
{
  "resources": {
    "scripts": {
      "pattern": "*.js",
      "directory": "scripts",
      "assets": {
        "main.js": {
          "files": "index.js"
        }
      }
    }
  }
}
```

--------------------------------------------------------------------------------

Each resource type MAY have a **directory** `string` attribute, defining where the assets are inside [`config.paths.src`](https://github.com/kaisermann/crius/blob/master/crius.json#L4) and where the built ones will be inside [`config.paths.dist`](https://github.com/kaisermann/crius/blob/master/crius.json#L5). If not specified, the resource type name will be used.

Each resource type MUST have a **assets** `object`, defining which assets are to be generated. The generated file output name is represented by the key:

```json
...
  "assets": {
    "main.js": {
      "files": "index.js",
      "autoload": "path/relative/to/**/gulpfile.js"
    }
  }
...
```

The value can be either a `string`, an array of `strings` or an `object` with a MUST-HAVE `files` and an OPTIONAL `autoload` properties.

If a path begins with `~`, `crius` references the `node_modules` directory. If not, the path is relative to the `resource directory`.

--------------------------------------------------------------------------------

`crius` **automatically** creates a gulp task for each resource. All of a resource assets will be moved from the [`config.paths.source`](https://github.com/kaisermann/crius/blob/master/crius.json#L4) to [`config.paths.dist`](https://github.com/kaisermann/crius/blob/master/crius.json#L5) without you doing anything besides defining the resource in the [`crius.json`](https://github.com/kaisermann/crius/blob/master/crius.json).

If a resource assets need any type of processing, a drop-in module can be created at [`gulpfile.js/tasks/resources/${resourceName}.js`](https://github.com/kaisermann/crius/blob/master/gulpfile.js/resources/) to modify the stream with a [lazypipe](https://github.com/OverZealous/lazypipe). The file name must match the resource name.

Resource module format:

```javascript
const lazypipe = require('lazypipe')

module.exports = {
  // Names of tasks to be ran before/after the resource task
  tasks: {
    before: ['nameOftaskToRunBEFOREThisOne'],
    after: ['nameOftaskToRunAFTERThisOne']
  },
  pipelines: {
    // Pipeline attached to each asset stream
    each: asset => {
      return lazypipe()
    },
    // Pipeline attached to all assets streams merged
    // Useful for manifests, etc
    merged: resourceInfo => {
      return lazypipe()
    },
  },
}
```

You can see other real examples by looking at the [`gulpfile.js/resources`](https://github.com/kaisermann/crius/blob/master/gulpfile.js/resources/) directory.

## External links

- [RolleiFLEX grid documentation](http://kaisermann.github.io/rolleiflex/)
- [Ruputure: Media Queries with Stylus documentation](http://jescalan.github.io/rupture/)
- [Sage documentation](https://github.com/roots/sage/) (Sage 9 uses webpack, please refer to the **8.*.*** documentation.)

## Credits and Inspirations

- [Asset builder](https://github.com/austinpray/asset-builder)
- [Sage Starter Theme](https://github.com/roots/sage/)

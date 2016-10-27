# Phase

> A gulp-automated front-end workflow based on the (awesome) [Sage starter theme](https://github.com/roots/sage) with some personal modifications :)

With Phase you can:
* Write CSS with:
  * Stylus (recommended)
    * Build your website's grid with the RolleiFLEX declarative (or not) grid framework. (stylus)
    * Use simplified media queries with rupture (stylus)
  * SCSS
* Write JS with Babel (ES2015)
* See live changes (CSS/JS/HTML) on your project with [browserSync](https://www.browsersync.io/)
* Have your [bower](https://bower.io/) packages automatically included in your assets
  * Check the **phase.json** on the **root** directory

## Requirements

1. [Node](https://nodejs.org/en/download/)
2. [Gulp CLI & Gulp 4](https://www.liquidlight.co.uk/blog/article/how-do-i-update-to-gulp-4/)

## Installation

1. `git clone git@github.com:kaisermann/phase.git`
2. `npm install` (it will also execute bower install)
3. Run at least `gulp build` before running `gulp watch`

## Documentation

### Phase

#### Manifest specification (phase.json)

##### [General manifest specification](https://github.com/kaisermann/asset-builder/blob/master/manifest.md)

##### Phase specific manifest documentation:

The `config.paths` object MAY have a `revisionManifest` `string` attribute that defines the revision manifest's file name on production distributions. See [Browserslist](https://github.com/ai/browserslist#queries) docs for available names and queries.

Defaults to:
```json
{
  "config": {
    "paths": {
      "revisionManifest": "assets.json"
    }
  }
}
```

* * *

The `config` object MAY have a `supportedBrowsers` **object** attribute defined by an array of browsers, which will be used to autoprefix a project's CSS. See [Browserslist](https://github.com/ai/browserslist#queries) docs for available names and queries.

Defaults to:
```json
{
  "config": {
    "supportedBrowsers": [
      "last 2 versions",
      "opera 12",
      "IE 10"
    ]
  }
}
```

* * *

The `config` object MUST have a `browserSync` **object** if it's planned to use browserSync.

```json
{
  "config": {
    "browserSync": {
      "files": [
        "{lib,templates}/**/*.{php,html}",
        "*.{php,html}"
      ],
      "whitelist": [],
      "blacklist": [],
      "devUrl":"localhost/phase"
    }
  }
}
```

`files` is an **optional** **array** or a `string` of files to be watched by browserSync. **Do not** watch your asset files via browserSync as they are already being watched by `gulp.watch`. Defaults to `[]`.

`whitelist` and `blacklist` are each one an **optional** **array** or a `string` of supposed watched files allowed/not allowed to be watched. Defaults to `[]`.

`devUrl` is a **mandatory** `string` that specifies your projects development proxy url.

 * * *

Each resource type MAY have a **directory** `string` attribute, defining where the assets are inside `config.paths.src`and where the built ones will be inside `config.paths.dist`. If not specified, the resource type name will be used.

Custom resource type directory name example:

```json
{
  "resources": {
    "scripts": {
      "pattern": "*.js",
      "directory": "js",
      "assets": {
        "main.js": {
          "files": "js/wrapper.js"
        }
      }
    }
  }
}
```

* * *

Each resource type MAY have a `dynamicTask` **boolean** attribute. If assigned to **true** it is automatically created an independent gulp task that mainly move files without any complicated logic. It's also possible to insert a helper in the middle of the task stream by creating a method with the same name as the `resource type name` in the taskHelpers object inside your gulpfile (see `taskHelpers.images`).

* * *

#### Generated assets configuration files
* ./phase.json
* assets/styles/config/*.styl

#### Gulp Tasks

* `gulp` / `gulp build` Erases distribution directory and builds all assets
* `gulp compile` Same as `gulp build`without deleting distribution directory
* `gulp scripts` Build everything on the scripts directory
* `gulp styles` Build everything on the styles directory
* `gulp fonts` Build everything on the fonts directory
* `gulp images` Build everything on the images directory
* `gulp clean` Deletes the distribution directory
* `gulp watch` Starts watching the asset files
* `gulp css-stats` Displays on the console some stats about your cssstats

#### Gulp Parameters

You can also pass the following parameters to gulp

* `--sync` Starts browserSync. Use only with `gulp watch`
* `--maps` Generates .map files
* `-d` Asset debug mode. It won't minify the files
* `-p` Production mode. File names will be appended with a hash of its content for cache-busting

### External
* [Sage documentation](https://github.com/roots/sage/) (Sage 9 uses webpack, please refer to the **8.\*.*** documentation.)
* [RolleiFLEX grid documentation](http://kaisermann.github.io/rolleiflex/)
* [Ruputure: Media Queries with Stylus documentation](http://jescalan.github.io/rupture/)

## Credits and Inspirations

* [Sage Starter Theme](https://github.com/roots/sage/)

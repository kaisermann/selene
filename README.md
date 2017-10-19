# Selene

> Opinionated Wordpress theme based on [Sage 9](https://github.com/roots/sage/) and [Crius](https://github.com/kaisermann/crius).

## Informations

- Write CSS with Stylus
  - Build your website's grid with the RolleiFLEX declarative flex helper framework. (stylus)
  - Use simplified media queries with rupture (stylus)
  - Responsive, fluid properties and [other useful mixins](https://github.com/kaisermann/crius/blob/master/assets/styles/config/mixins.styl)
- Write modern Javascript
- See live changes (CSS/JS/HTML) on your project with [browserSync](https://www.browsersync.io/)
- Need to manage a new type of resource, like, let's say... sounds? Just define it in the [`crius.json`](https://github.com/kaisermann/crius/blob/master/crius.json) and let the magic happen!
- Component oriented folder structure.

## Requirements

* [WordPress](https://wordpress.org/) >= 4.7
* [PHP](http://php.net/manual/en/install.php) >= 7
* [Composer](https://getcomposer.org/download/)
* [Node.js](http://nodejs.org/) >= 7.x.x
* [Gulp](https://www.liquidlight.co.uk/blog/article/how-do-i-update-to-gulp-4/) >= 4.x.x

#### Recommended

* [ACF](https://www.advancedcustomfields.com/) >= 5.x.x

## Components

* A component javascript modules can be imported by using the alias `@Components/...pathToComponent`
  * Example: `import Header from '@Components/Header/Header.js'`
  * Example 2: `import SubHeader from '@Components/Header/SubHeder/SubHeader.js'`
  * There's also an alias for the 'scripts' directory available: `@Scripts/...`
* A component `.styl` file is imported automatically by the [`index.styl`](https://github.com/kaisermann/selene/blob/master/resources/assets/styles/index.styl).
* A component blade template can be included in the same way as any blade file. The inclusion is relative to the current template or to the `views` directory.
  * Example: `@include('Components.Header.Header')`
* Gulp can create or delete components:
  * `gulp component --create component1,component2,component3,...`
  * `gulp component --delete component1,component2,component3,...`

## Controllers

You can use controllers to pass data to specific templates. A controller must be created inside the [`./app/controllers/`](https://github.com/kaisermann/selene/blob/master/app/controllers/) directory.

[Controller documentation](https://github.com/soberwp/controller)

## Custom Blade Directives

* `@mainquery ... @endmainquery` - Loops through the main query;
* `@customquery(\WP_Query $queryObj) ... @endcustomquery` - Loops through a custom query;
* `@visitor ... @endvisitor` - Shows a certain content only to site visitors (not logged in);
* `@loggedin ... @endloggedin` - Shows a certain content only logged users;
* `@shortcode` - Executes a certain shortcode;
* `@inlinesvg` - Prints the specified SVG file;
* `@dump` - Dumps an php variable with a `var_export`;
* `@console` - Dumps a php variable in the javascript console;

Directives can be defined on [`config/directives.php`](https://github.com/kaisermann/selene/blob/master/config/directives.php).

## WordPress tweaks

* Front-end
  * Cleans up and prettify your `body_class()` output;
  * Cleans up your `<head>`;
  * Scripts load with `defer`;
  * Rewrites the search url `.com/?s=term` with `.com/search/term`;
  * Wraps all `oembed` inside `the_content()` around a `<div class="oembed-container">`;
  * Removes all protocols (`http`,`https`) from urls;
  * [Dashboard and login page]((https://github.com/kaisermann/selene/blob/master/resources/assets/styles/wordpress/dashboard-login/config.styl)) CSS customization;
  * Custom text editor CSS customization with the [`editor.styl`](https://github.com/kaisermann/selene/blob/master/resources/assets/styles/wordpress/editor.styl) file;
  * Provides an [`appMeta`](https://github.com/kaisermann/selene/blob/master/app/setup.php#L113) global javascript object with the ajax and home urls.

* Back-end
  * Sets uploaded JPEG quality to 100;
  * Provides options on the admin dashboard to crop default medium and large image sizes;
  * While `WP_DEBUG` is true or `WP_ENV` is equal to 'development', the enqueued assets will have a cache-busting filename;
  * Provides [John Billion's libraries](https://github.com/johnbillion/extended-cpts) which make painless to create custom post types and taxonomies.
  * Uses ACF Builder to build ACF fields in the theme's source code instead of the website's database.
  * Uses [Whoops](https://github.com/filp/whoops) error handler for... handling errors.

## ACF Builder

Selene comes out of the box with [ACF Builder](https://github.com/StoutLogic/acf-builder) which makes a piece-of-cake to programmatically create custom fields with ACF.

Create your `field group` inside the root of [`app/fields`](https://github.com/kaisermann/selene/blob/master/app/fields) and return one (the `field group` itself) or more (an array of `field groups`).

<<<<<<< HEAD
If ACF is not installed, the files will be ignored.
||||||| merged common ancestors
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

If a resource assets need any type of processing, a drop-in module can be created at [`.crius/resource-modules/${resourceName}.js`](https://github.com/kaisermann/crius/blob/master/.crius/resource-modules/) to modify the stream with a [lazypipe](https://github.com/OverZealous/lazypipe). The file name must match the resource name.

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

You can see other real examples by looking at the [`.crius/resource-modules`](https://github.com/kaisermann/crius/blob/master/.crius/resource-modules/) directory.

--------------------------------------------------------------------------------

Each CSS `asset` MAY have a **uncss** `boolean` attribute. If `true` the `uncss` task will search the file for unused selectors based on a `sitemap.json` file. The `sitemap.json` must be composed by an array of your projects pages urls.

```json
{
  "resources": {
    "styles": {
      "pattern": "*.css",
      "directory": "styles",
      "assets": {
        "main.css": {
          "uncss": true,
          "files": "index.styl"
        },
        "admin.css": {
          "files": "admin.styl"
        }
      }
    }
  }
}
```

## Supported browsers

The supported browsers for CSS autoprefixing, eslint-compat plugin, etc can be configured by editing the `browserslist` array inside the [`package.json`](https://github.com/kaisermann/crius/blob/master/package.json).

## Theme Development

### Out of the box tasks

- `gulp` / `gulp build` Erases distribution directory and builds all assets
- `gulp compile` Same as `gulp build` without deleting distribution directory
- `gulp clean` Deletes the distribution directory
- `gulp watch` Starts watching the asset files
- `gulp uncss` Reads a `sitemap.json` file and removes unused selectors
- `gulp sizereport` Displays the size and gzipped size of your project

### Out of the box resource tasks

- `gulp scripts` Build everything on the scripts directory
- `gulp styles` Build everything on the styles directory
- `gulp fonts` Build everything on the fonts directory
- `gulp images` Build everything on the images directory

### Creating new tasks

To create new generic gulp tasks, just create a file inside `.crius/tasks`, import `gulp` and create a task as if it was inside the gulpfile itself.

All tasks defined on the mentioned directory are imported BEFORE the resource tasks. If it's needed to load them AFTER the resource tasks, you can define a 'later-loading' queue at the beginning of the [`gulpfile.js`](https://github.com/kaisermann/crius/blob/master/gulpfile.js). For an example, check the [`loadLater`](https://github.com/kaisermann/crius/blob/master/gulpfile.js#L6) constant which already delays the loading of `default.js`.

### Gulp Parameters

You can also pass the following parameters to gulp:

- `--sync` Starts browserSync. Use only with `gulp watch`
- `--report` or `-r` Report mode
  - If used with `watch`, it will display the assets sizes of the current resource being edited
- `--maps` Allows sourcemaps to be created
- `-d` Asset debug mode. It won't minify the files
- `-p` Production mode. File names will be appended with a hash of its content for cache-busting

The available parameters can be extended at [`.crius/params.js`](https://github.com/kaisermann/crius/blob/master/.crius/params.js).
=======
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

If a resource assets need any type of processing, a drop-in module can be created at [`gulpfile.js/resources/${resourceName}.js`](https://github.com/kaisermann/crius/blob/master/gulpfile.js/resources/) to modify the stream with a [lazypipe](https://github.com/OverZealous/lazypipe). The file name must match the resource name.

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

--------------------------------------------------------------------------------

Each CSS `asset` MAY have a **uncss** `boolean` attribute. If `true` the `uncss` task will search the file for unused selectors based on a `sitemap.json` file. The `sitemap.json` must be composed by an array of your projects pages urls.

```json
{
  "resources": {
    "styles": {
      "pattern": "*.css",
      "directory": "styles",
      "assets": {
        "main.css": {
          "uncss": true,
          "files": "index.styl"
        },
        "admin.css": {
          "files": "admin.styl"
        }
      }
    }
  }
}
```

## Supported browsers

The supported browsers for CSS autoprefixing, eslint-compat plugin, etc can be configured by editing the `browserslist` array inside the [`package.json`](https://github.com/kaisermann/crius/blob/master/package.json).

## Theme Development

### Out of the box tasks

- `gulp` / `gulp build` Erases distribution directory and builds all assets
- `gulp compile` Same as `gulp build` without deleting distribution directory
- `gulp clean` Deletes the distribution directory
- `gulp watch` Starts watching the asset files
- `gulp uncss` Reads a `sitemap.json` file and removes unused selectors
- `gulp sizereport` Displays the size and gzipped size of your project

### Out of the box resource tasks

- `gulp scripts` Build everything on the scripts directory
- `gulp styles` Build everything on the styles directory
- `gulp fonts` Build everything on the fonts directory
- `gulp images` Build everything on the images directory

### Creating new tasks

To create new generic gulp tasks, just create a file inside `gulpfile.js/tasks`, import `gulp` and create a task as if it was inside the gulpfile itself.

All tasks defined on the mentioned directory are imported BEFORE the resource tasks. If it's needed to load them AFTER the resource tasks, you can define a 'later-loading' queue at the beginning of the [`gulpfile.js`](https://github.com/kaisermann/crius/blob/master/gulpfile.js). For an example, check the [`loadLater`](https://github.com/kaisermann/crius/blob/master/gulpfile.js/index.js#L6) constant which already delays the loading of `default.js`.

### Gulp Parameters

You can also pass the following parameters to gulp:

- `--sync` Starts browserSync. Use only with `gulp watch`
- `--report` or `-r` Report mode
  - If used with `watch`, it will display the assets sizes of the current resource being edited
- `--maps` Allows sourcemaps to be created
- `-d` Asset debug mode. It won't minify the files
- `-p` Production mode. File names will be appended with a hash of its content for cache-busting

The available parameters can be extended at [`gulpfile.js/params.js`](https://github.com/kaisermann/crius/blob/master/gulpfile.js/params.js).
>>>>>>> 8eea98106add19adc6c7127be57b4b098a972d8f

## Build commands

Useful gulp tasks aliases

- `yarn run watch`
- `yarn run build`
- `yarn run build:staging`
- `yarn run build:production`

## External links
* [Crius documentation](https://github.com/kaisermann/crius)
* [Sage 9 documentation](https://github.com/roots/docs/tree/sage-9/sage) (currently in progress)

# Selene

> Opinionated Wordpress theme based on [Sage 9](https://github.com/roots/sage/)
> and [Crius](https://github.com/kaisermann/crius).

This project is being constantly modified (I promise to fix the commit mess
someday).

## Informations

* Write CSS with Stylus
  * Build your website's grid with the RolleiFLEX declarative flex helper
    framework. (stylus)
  * Use simplified media queries with rupture (stylus)
  * Responsive, fluid properties and
    [other useful mixins](https://github.com/kaisermann/crius/blob/master/assets/styles/config/mixins.styl)
* Write modern Javascript
* See live changes (CSS/JS/HTML) on your project with
  [browserSync](https://www.browsersync.io/)
* Need to manage a new type of resource, like, let's say... sounds? Just define
  it in the
  [`crius.json`](https://github.com/kaisermann/crius/blob/master/crius.json) and
  let the magic happen!
* Component oriented folder structure.

## Requirements

* [WordPress](https://wordpress.org/) >= 4.7
* [PHP](http://php.net/manual/en/install.php) >= 7
* [Composer](https://getcomposer.org/download/)
* [Node.js](http://nodejs.org/) >= 8.6.0
* [Gulp](https://www.liquidlight.co.uk/blog/article/how-do-i-update-to-gulp-4/) >=
  4.x.x

### Recommended

* [ACF](https://www.advancedcustomfields.com/) >= 5.x.x

## Components

* A component javascript modules can be imported by using the alias
  `@Components/...pathToComponent`
  * Example: `import Header from '@Components/Header/Header.js'`
  * Example 2: `import SubHeader from
    '@Components/Header/SubHeder/SubHeader.js'`
  * There's also an alias for the 'scripts' directory available: `@Scripts/...`
* A component `.styl` file is imported automatically by the
  [`index.styl`](https://github.com/kaisermann/selene/blob/master/resources/assets/styles/index.styl).
* A component blade template can be included in the same way as any blade file.
  The inclusion is relative to the current template or to the `views` directory.
  * Example: `@include('Components.Header.Header')`
* Gulp can create or delete components:
  * `gulp component --create component1,component2,component3,...`
  * `gulp component --delete component1,component2,component3,...`

## Controllers

You can use controllers to pass data to specific templates. A controller must be
created inside the
[`./app/controllers/`](https://github.com/kaisermann/selene/blob/master/app/controllers/)
directory.

[Controller documentation](https://github.com/soberwp/controller)

## Custom Blade Directives

* `@mainquery ... @endmainquery` - Loops through the main query;
* `@customquery(\WP_Query $queryObj) ... @endcustomquery` - Loops through a
  custom query;
* `@visitor ... @endvisitor` - Shows a certain content only to site visitors
  (not logged in);
* `@loggedin ... @endloggedin` - Shows a certain content only logged users;
* `@shortcode` - Executes a certain shortcode;
* `@inlinesvg` - Prints the specified SVG file;
* `@dump` - Dumps an php variable with a `var_export`;
* `@console` - Dumps a php variable in the javascript console;

Directives can be defined on
[`config/directives.php`](https://github.com/kaisermann/selene/blob/master/config/directives.php).

## WordPress tweaks

* Front-end

  * Cleans up and prettify your `body_class()` output;
  * Cleans up your `<head>`;
  * Scripts load with `defer`;
  * Rewrites the search url `.com/?s=term` with `.com/search/term`;
  * Wraps all `oembed` inside `the_content()` around a `<div
    class="oembed-container">`;
  * Removes all protocols (`http`,`https`) from urls;
  * [Dashboard and login page](<(https://github.com/kaisermann/selene/blob/master/resources/assets/styles/wordpress/dashboard-login/config.styl)>)
    CSS customization;
  * Custom text editor CSS customization with the
    [`editor.styl`](https://github.com/kaisermann/selene/blob/master/resources/assets/styles/wordpress/editor.styl)
    file;
  * Provides an
    [`selene`](https://github.com/kaisermann/selene/blob/master/app/setup.php#L113)
    global javascript object with the ajax, home and assets urls.

* Back-end
  * Sets uploaded JPEG quality to 100;
  * Provides options on the admin dashboard to crop default medium and large
    image sizes;
  * While `WP_DEBUG` is true or `WP_ENV` is equal to 'development', the enqueued
    assets will have a cache-busting filename;
  * Provides
    [John Billion's libraries](https://github.com/johnbillion/extended-cpts)
    which make painless to create custom post types and taxonomies.
  * Uses [ACF Builder](https://github.com/StoutLogic/acf-builder) to build ACF
    fields in the theme's source code instead of the website's database.
  * Uses [Whoops](https://github.com/filp/whoops) error handler for... handling
    errors.

## ACF Builder

Selene comes out of the box with
[ACF Builder](https://github.com/StoutLogic/acf-builder) which makes a
piece-of-cake to programmatically create custom fields with ACF.

Create your `field group` inside the root of
[`app/fields`](https://github.com/kaisermann/selene/blob/master/app/fields) and
return one (the `field group` itself) or more (an array of `field groups`).

If ACF is not installed, the files will be ignored.

## Build commands

Pretty much every task needed is covered by the `package.json` scripts:

* `npm run watch|start` - Run browsersync and watch file changes;
* `npm run build` - Build minified assets;
* `npm run build:dev` - Build unminified assets;
* `npm run build:production` - Build the assets, append a hash to the name;
* `npm run clean` - Remove the `dist` folder;
* `npm run lint` - Lint all `styl` and `js` files;
* `npm run lint:styles` - Lint all `styl` files;
* `npm run lint:scripts` - Lint all `js` files.

## Extra Gulp tasks (others listed [here](https://github.com/kaisermann/crius))

* `gulp purify` - Reads `.blade.php` and `.js` files and removes unused css
  definitions.

## External links

* [Crius documentation](https://github.com/kaisermann/crius)
* [Sage 9 documentation](https://github.com/roots/docs/tree/sage-9/sage)
  (currently in progress)

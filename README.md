# Selene

> Wordpress theme based on [Sage 9](https://github.com/roots/sage/) and [Crius](https://github.com/kaisermann/crius).

## Informations

- Write CSS with Stylus
  - Build your website's grid with the RolleiFLEX declarative flex helper framework. (stylus)
  - Use simplified media queries with rupture (stylus)
  - Responsive font-size and [other useful mixins](https://github.com/kaisermann/crius/blob/master/assets/styles/config/mixins.styl)
- Write modern Javascript
- See live changes (CSS/JS/HTML) on your project with [browserSync](https://www.browsersync.io/)
- Need to manage a new type of resource, like, let's say... sounds? Just define it in the [`crius.json`](https://github.com/kaisermann/crius/blob/master/crius.json) and let the magic happen!

## Requirements

* [WordPress](https://wordpress.org/) >= 4.7
* [PHP](http://php.net/manual/en/install.php) >= 5.6.4
* [Composer](https://getcomposer.org/download/)
* [Node.js](http://nodejs.org/) >= 7.x.x
* [Gulp](https://www.liquidlight.co.uk/blog/article/how-do-i-update-to-gulp-4/) >= 4.x.x

### Components

* A component javascript modules can be imported by using the alias `@Components/...pathToComponent`
  * Example: `import Header from '@Components/Header/Header.js'`
  * Example 2: `import SubHeader from '@Components/Header/SubHeder/SubHeader.js'`
  * There's also an alias for the 'scripts' directory available: `@Scripts/...`
* A component `.styl` file is imported automatically by the [`wrapper.styl`](https://github.com/kaisermann/selene/blob/master/assets/styles/wrapper.styl).
* A component blade template can be included in the same way as any blade file. The inclusion is relative to the current template or to the `views` directory.
  * Example: `@include('Components.Header.Header')`
* Gulp can create or delete components:
  * `gulp component --create component1,component2,component3,...`
  * `gulp component --delete component1,component2,component3,...`

### Controllers

You can use controllers to pass data to specific templates. A controller must be created inside the [`./resources/controllers/`](https://github.com/kaisermann/selene/blob/master/resources/controllers/) directory.

[Controller documentation](https://github.com/soberwp/controller)

### Custom Blade Directives

* `@mainquery ... @endmainquery` - Loops through the main query;
* `@customquery(\WP_Query $queryObj) ... @endcustomquery` - Loops through a custom query;
* `@shortcode` - Executes a certain shortcode;
* `@inlinesvg` - Prints the specified SVG file;
* `@dump` - Dumps an php variable with a `var_export`;
* `@console` - Dumps a php variable in the javascript console;
* `@set($var, value)` - Sets a PHP variable.

Directives can be defined on [`app/directives.php`](https://github.com/kaisermann/selene/blob/master/app/directives.php).

## WordPress tweaks

* Front-end
  * Cleans up and prettify your `body_class()` output;
  * Cleans up your `<head>`;
  * Scripts load with `defer`;
  * Rewrites the search url `.com/?s=term` with `.com/search/term`;
  * Wraps all `oembed` around a `<div class="embed">`;
  * Remove all protocols (`http`,`https`) from urls;
  * Admin dashboard and login page CSS customization with the [`admin.styl`](https://github.com/kaisermann/selene/blob/master/resources/assets/styles/wordpress/admin/config.styl) file;
  * Custom text editor CSS customization with the [`editor.styl`](https://github.com/kaisermann/selene/blob/master/resources/assets/styles/wordpress/editor.styl) file;
  * Provides an [`appMeta`](https://github.com/kaisermann/selene/blob/master/app/setup.php#L113) global javascript object with the ajax and home urls.

* Back-end
  * Sets uploaded JPEG quality to 100;
  * Provides options on the admin dashboard to crop default medium and large image sizes;
  * While `WP_DEBUG` is true or `WP_ENV` is equal to 'development', the enqueued assets will have a cache-busting file name;
  * Provides John Billion's libraries which make painless to create custom post types and taxonomies.
    * https://github.com/johnbillion/extended-cpts
    * https://github.com/johnbillion/extended-taxos

#### Build commands

Useful gulp tasks aliases

- `yarn run watch`
- `yarn run build`
- `yarn run build:staging`
- `yarn run build:production`

## External links
* [Crius documentation](https://github.com/kaisermann/crius)
* [Sage 9 documentation](https://github.com/roots/docs/tree/sage-9/sage) (currently in progress)

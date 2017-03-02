# Selene

> Wordpress theme based on [Sage 9](https://github.com/roots/sage/) and [Crius](https://github.com/kaisermann/crius).

## Informations

### Requirements

* [WordPress](https://wordpress.org/) >= 4.7
* [PHP](http://php.net/manual/en/install.php) >= 5.6.4
* [Composer](https://getcomposer.org/download/)
* [Node.js](http://nodejs.org/) >= 6.9.x
* [Gulp](https://www.liquidlight.co.uk/blog/article/how-do-i-update-to-gulp-4/) >= 4.x.x

#### Controllers

You can use controllers to pass data to specific templates. A controller must be created inside the [`src/controllers/`](https://github.com/kaisermann/selene/blob/master/src/controllers/) directory and have its scope listed on the `$controllers` variable of [`src/controllers.php`](https://github.com/kaisermann/selene/blob/master/src/controllers.php). A controller scope is defined by each class name returned by `get_body_class`.

Selene prepends a `global` class to the `body`, creating a global controller that can pass data to any template.

#### Custom Blade Directives

Default custom directives:

* `@mainquery ... @endmainquery` - Loops through the main query.

* `@customquery(\WP_Query $queryObj) ... @endcustomquery` - Loops through a custom query.

Directives can be defined on [`src/directives.php`](https://github.com/kaisermann/selene/blob/master/src/directives.php).

## Observations

- If you need polyfills for [`Object.assign()`, `Object.entries()`, `Promises`, etc](https://github.com/zloirock/core-js), set the [`"polyfill": false`](https://github.com/kaisermann/selene/blob/master/.babelrc#L12) to true inside the [`.babelrc`](https://github.com/kaisermann/selene/blob/master/.babelrc).

## External links
* [Crius documentation](https://github.com/kaisermann/crius)
* [Sage 9 documentation](https://github.com/roots/docs/tree/sage-9/sage) (currently in progress)

# Selene

Wordpress theme based on [Sage 9](https://github.com/roots/sage/) and [crius](https://github.com/kaisermann/crius) asset workflow ([modified Sage 8](https://github.com/roots/sage/tree/8.5.0)).

## Informations

#### Controllers

You can use controllers to pass data to specific templates. A controller must be created inside the `src/controllers/` directory and have its scope listed on the `$controllers` variable of `src/controllers.php`. A controller scope is defined by each class name returned by `get_body_class`.

Selene prepends a `global` class to the `body`, creating a global controller that can pass data to any template.

#### Custom Blade Directives

Default custom directives:

* `@mainquery ... @endmainquery` - Loops through the main query.

* `@customquery(\WP_Query $queryObj) ... @endcustomquery` - Loops through a custom query.

Directives can be defined on `src/directives.php`.

<?php

namespace App;

use Roots\Sage\Container;
use Illuminate\Contracts\Container\Container as ContainerContract;

/**
 * Get the sage container.
 *
 * @param string $abstract
 * @param array  $parameters
 * @param ContainerContract $container
 * @return ContainerContract|mixed
 * @SuppressWarnings(PHPMD.StaticAccess)
 */
function sage( $abstract = null, $parameters = [], ContainerContract $container = null ) {
	$container = $container ?: Container::getInstance();
	if ( ! $abstract ) {
		return $container;
	}
	return $container->bound( $abstract )
		? $container->makeWith( $abstract, $parameters )
		: $container->makeWith( "sage.{$abstract}", $parameters );
}

/**
 * Get / set the specified configuration value.
 *
 * If an array is passed as the key, we will assume you want to set an array of values.
 *
 * @param array|string $key
 * @param mixed $default
 * @return mixed|\Roots\Sage\Config
 * @copyright Taylor Otwell
 * @link https://github.com/laravel/framework/blob/c0970285/src/Illuminate/Foundation/helpers.php#L254-L265
 */
function config( $key = null, $default = null ) {
	if ( is_null( $key ) ) {
		return sage( 'config' );
	}
	if ( is_array( $key ) ) {
		return sage( 'config' )->set( $key );
	}
	return sage( 'config' )->get( $key, $default );
}

/**
 * @param string $file
 * @param array $data
 * @return string
 */
function template( $file, $data = [] ) {
	return sage( 'blade' )->render( $file, $data );
}

/**
 * Retrieve path to a compiled blade view
 * @param $file
 * @param array $data
 * @return string
 */
function template_path( $file, $data = [] ) {
	return sage( 'blade' )->compiledPath( $file, $data );
}

/**
 * @param $asset
 * @return string
 */
function asset_path( $asset ) {
	return sage( 'assets' )->getUri( $asset );
}

/**
 * Renders the specified blade template
 * @param string $templatePath
 * @param $data
 * @return null
 */
function renderTemplate( $templatePath, $data = []) {
	echo template( config( 'dir.stylesheet' ) . "/views/{$templatePath}.blade.php", $data);
}

function renderComponent( $componentName, $data = []) {
	echo template( config( 'dir.stylesheet' ) . "/components/{$componentName}/{$componentName}.blade.php", $data);
}

/**
 * Dumps an variable in the console/php stdout
 * @param $data
 * @param bool $phpPrint
 * @param bool $onlyLogged
 * @return null
 */
function dump( $data, $phpPrint = false, $onlyLogged = true ) {
	if ( ! $onlyLogged || is_user_logged_in() ) {
		if ( $phpPrint ) {
			echo '<pre style="white-space: pre-wrap;">' . htmlspecialchars( @var_export( $data, true ) ) . '</pre>';
		} else {
			echo '<script>console.log(' . ((is_array( $data ) || is_object( $data )) ? json_encode( $data ) : $data) . ');</script>';
		}
	}
}

/**
 * Returns or echoes the specified svg file content
 * @param string $path
 * @param bool $echo
 * @return string
 */
function getSVG( $path, $echo = true ) {
	$realPath = config( 'dir.stylesheet' ) . "/../dist/images/{$path}.svg";
	$content = file_get_contents( realpath( $realPath ) );
	if ( $echo ) {
		echo $content;
	}
	return $content;
}

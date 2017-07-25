<?php

namespace App;

use Roots\Sage\Container;

/**
 * Get the sage container.
 *
 * @param string $abstract
 * @param array  $parameters
 * @param ContainerContract $container
 * @return ContainerContract|mixed
 * @SuppressWarnings(PHPMD.StaticAccess)
 */
function sage( $abstract = null, $parameters = [], Container $container = null ) {
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
 *
 * Note: modified to work with manfiest generated by gulp-rev
 */
function asset_path( $asset ) {
	$dir = dirname($asset);
	$assetName = basename($asset);
	return join('/', [
		config( 'assets' )[ 'uri' ],
		$dir,
		sage( 'assets' )->get( $assetName )
	]);
}

/**
 * @param string|string[] $templates Possible template files
 * @return array
 */
function filter_templates($templates) {
	return collect($templates)
		->map(function ($template) {
			return preg_replace('#\.(blade\.)?php$#', '', ltrim($template));
		})
		->flatMap(function ($template) {
			$paths = apply_filters('sage/filter_templates/paths', ['views', 'resources/views']);

			return collect($paths)
				->flatMap(function ($path) use ($template) {
						return [
							"{$path}/{$template}.blade.php",
							"{$path}/{$template}.php",
							"{$template}.blade.php",
							"{$template}.php",
						];
				});
		})
		->filter()
		->unique()
		->all();
}

/**
 * @param string|string[] $templates Relative path to possible template files
 * @return string Location of the template
 */
function locate_template($templates) {
		return \locate_template(filter_templates($templates));
}

/**
 * Renders the specified blade template
 * @param string $templatePath
 * @param $data
 * @return null
 */
function renderTemplate( $templatePath, $data = []) {
	echo template( config( 'theme' )[ 'dir' ] . "/resources/views/{$templatePath}.blade.php", $data);
}

function renderComponent( $componentName, $data = []) {
	echo template( config( 'theme' )[ 'dir' ] . "/resources/components/{$componentName}/{$componentName}.blade.php", $data);
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
	$realPath = config( 'theme' )[ 'dir' ] . "/dist/images/{$path}.svg";
	$content = file_get_contents( realpath( $realPath ) );
	if ( $echo ) {
		echo $content;
	}
	return $content;
}

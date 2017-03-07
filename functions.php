<?php

/**
 * Do not edit anything in this file unless you know what you're doing
 */

/**
 * Helper function for prettying up errors
 * @param string $message
 * @param string $subtitle
 * @param string $title
 */
$sage_error = function ( $message, $subtitle = '', $title = '' ) {
	$title = $title ?: __( 'Sage &rsaquo; Error', 'selene' );
	$footer = '<a href="https://roots.io/sage/docs/">roots.io/sage/docs/</a>';
	$message = "<h1>{$title}<br><small>{$subtitle}</small></h1><p>{$message}</p><p>{$footer}</p>";
	wp_die( $message, $title );
};

/**
 * Ensure compatible version of PHP is used
 */
if ( version_compare( '5.6.4', phpversion(), '>=' ) ) {
	$sage_error(__( 'You must be using PHP 5.6.4 or greater.', 'selene' ), __( 'Invalid PHP version', 'selene' ));
}

/**
 * Ensure compatible version of WordPress is used
 */
if ( version_compare( '4.7.0', get_bloginfo( 'version' ), '>=' ) ) {
	$sage_error(__( 'You must be using WordPress 4.7.0 or greater.', 'selene' ), __( 'Invalid WordPress version', 'selene' ));
}

/**
 * Ensure dependencies are loaded
 */
if ( ! class_exists( 'Roots\\Sage\\Container' ) ) {
	if ( ! file_exists( $composer = __DIR__ . '/vendor/autoload.php' ) ) {
		$sage_error(
			__( 'You must run <code>composer install</code> from the Sage directory.', 'selene' ),
			__( 'Autoloader not found.', 'selene' )
		);
	}
	require_once $composer;
}

/**
 * Includes an array of php files
 */
function includeArrayOfFiles( $includeArray, $path ) {
	global $sage_error;
	array_map(function ( $file ) use ( $sage_error, $path ) {
		$file = "{$path}/{$file}.php";
		if ( ! locate_template( $file, true, true ) ) {
			$sage_error(sprintf( __( 'Error locating <code>%s</code> for inclusion.', 'selene' ), $file ), 'File not found');
		}
	}, $includeArray);
}

/**
 * Sage required files
 *
 * The mapped array determines the code library included in your theme.
 * Add or remove files to the array as needed. Supports child theme overrides.
 */
includeArrayOfFiles([
	'helpers',
	'setup',
	'filters',
	'admin',
	'directives',
	'controllers',
	'ajax',
], 'src');

/**
 * Here's what's happening with these hooks:
 * 1. WordPress initially detects theme in themes/sage
 * 2. Upon activation, we tell WordPress that the theme is actually in themes/sage/views
 * 3. When we call get_template_directory() or get_template_directory_uri(), we point it back to themes/sage
 *
 * We do this so that the Template Hierarchy will look in themes/sage/views for core WordPress themes
 * But functions.php, style.css, and index.php are all still located in themes/sage
 *
 * This is not compatible with the WordPress Customizer theme preview prior to theme activation
 *
 * get_template_directory()   -> /srv/www/example.com/current/web/app/themes/sage
 * get_stylesheet_directory() -> /srv/www/example.com/current/web/app/themes/sage
 * locate_template()
 * ├── STYLESHEETPATH         -> /srv/www/example.com/current/web/app/themes/sage
 * └── TEMPLATEPATH           -> /srv/www/example.com/current/web/app/themes/sage/views
 */
if ( is_customize_preview() && isset( $_GET['theme'] ) ) {
	$sage_error(__( 'Theme must be activated prior to using the customizer.', 'selene' ));
}
add_filter('template', function ( $stylesheet ) {
	return dirname( $stylesheet );
});
if ( basename( $stylesheet = get_option( 'template' ) ) !== 'views' ) {
	update_option( 'template', "{$stylesheet}/views" );
	wp_redirect( $_SERVER['REQUEST_URI'] );
	exit();
}

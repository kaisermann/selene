<?php

if ( file_exists( $composer = __DIR__ . '/vendor/autoload.php' ) ) {
	require_once $composer;
}

add_filter('template', function ( $stylesheet ) {
	return dirname( $stylesheet );
});

add_action('after_switch_theme', function () {
	$stylesheet = get_option( 'template' );
	if ( basename( $stylesheet ) !== 'templates' ) {
		update_option( 'template', $stylesheet . '/templates' );
	}
});

$includes = [
	'src/helpers.php',
	'src/setup.php',
	'src/filters.php',
	'src/admin.php',
	'src/ajax.php',
];
array_walk($includes, function ( $file ) {
	if ( ! locate_template( $file, true, true ) ) {
		trigger_error( sprintf( __( 'Error locating %s for inclusion', 'sepha' ), $file ), E_USER_ERROR );
	}
});

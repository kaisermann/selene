<?php

namespace App;

use Roots\Sage\Container;

/**
 * @param string $name
 * @return Container|mixed
 */
function sage( $name = '' ) {
	static $container;
	if ( ! $container ) {
		$container = new Container;
	}
		return $name ? (isset( $container[ $name ] ) ? $container[ $name ] : $container[ "sage.{$name}" ]) : $container;
}

/**
 *
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
 * Determine whether to show the sidebar
 * @return bool
 */
function display_sidebar() {
	static $display;
	isset( $display ) || $display = apply_filters( 'sage/display_sidebar', false );
	return $display;
}

/**
 * Page titles
 * @return string
 */
function title() {
	if ( is_home() ) {
		if ( $home = get_option( 'page_for_posts', true ) ) {
			return get_the_title( $home );
		}

		return __( 'Latest Posts', 'sepha' );
	}

	if ( is_archive() ) {
		return get_the_archive_title();
	}

	if ( is_search() ) {
		return sprintf( __( 'Search Results for %s', 'sepha' ), get_search_query() );
	}

	if ( is_404() ) {
		return __( 'Not Found', 'sepha' );
	}

	return get_the_title();
}

function debug( $data, $phpPrint = false, $onlyLogged = true ) {
	if ( ! $onlyLogged || is_user_logged_in() ) {
		if ( $phpPrint ) {
			echo '<pre style="white-space: pre-wrap;">';
			ob_start();
			var_dump( $data );
			echo htmlspecialchars( ob_get_clean() );
			echo '</pre>';
		} else {
			echo '<script>console.log(' . ((is_array( $data ) || is_object( $data )) ? json_encode( $data ) : $data) . ');</script>';
		}
	}
}

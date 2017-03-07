<?php

namespace App;

$controllers = array_map(function($val) {
	return basename($val, '.php');
}, glob( __DIR__ . '/controllers/*.php'));

function registerController( $scopes, $fn ) {
	if ( ! is_array( $scopes ) ) {
		$scopes = [ $scopes ];
	}
	foreach ( $scopes as $scope ) {
		add_filter( "sage/template/{$scope}/data", function( $data, $template ) use ( $fn ) {
			return $data + $fn($data, $template);
		}, 10, 2 );
	}
}

// Includes the files listed on $controllers
includeArrayOfFiles( $controllers, 'src/controllers' );

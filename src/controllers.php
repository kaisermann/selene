<?php

namespace App;

function controller( $scopes, $fn ) {
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
includeArrayOfFiles(
	array_map(function( $filePath ) {
			return basename( $filePath, '.php' );
		}, glob( get_stylesheet_directory() . '/controllers/*.php' )
	),
	'controllers'
);

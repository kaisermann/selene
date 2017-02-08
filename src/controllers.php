<?php

namespace App;

$controllers = [ 'global' ];

function registerController( $scope, $fn ) {
	add_filter( "sage/template/$scope/data", $fn, 10, 2 );
}

// Includes the files listed on $controllers
includeArrayOfFiles($controllers, 'src/controllers');

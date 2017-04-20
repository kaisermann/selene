<?php

namespace App;

controller('app', function( $data, $template ) {
	return [
		'c_current_template' => basename( $template ,'.blade.php' ),
		'c_primary_nav_args' => [
			'theme_location' => 'primary_navigation',
			'walker' => new \BEM\MenuWalker,
			'block' => 'header__nav',
			'menu_class' => 'nav header__nav',
			'container' => false,
		],
	];
});

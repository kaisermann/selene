<?php

namespace App;

registerController('global', function( $data, $template ) {
	return $data + [
		'current_template' => basename( $template ,'.blade.php' ),
		'primary_nav_args' => [
		'theme_location' => 'primary_navigation',
		'menu_class' => 'nav',
		'walker' => new \BEM\MenuWalker,
		'block' => 'header__menu',
		'menu_class' => 'nav header__menu',
		'container' => false,
		],
	];
});

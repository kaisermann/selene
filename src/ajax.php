<?php

namespace App;

$methods = [];

foreach ( $methods as $method ) {
	add_action( 'wp_ajax_nopriv_' . $method, __NAMESPACE__ . '\\action__' . $method );
	add_action( 'wp_ajax_' . $method, __NAMESPACE__ . '\\action__' . $method );
}

// Ajax methods

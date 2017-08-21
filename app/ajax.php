<?php

namespace App;

/**
 * Ajax methods
 */
$methods = [];

foreach ($methods as $method) {
    add_action('wp_ajax_nopriv_' . $method, 'App\\' . $method);
    add_action('wp_ajax_' . $method, 'App\\' . $method);
}

// Ajax methods down here

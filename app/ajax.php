<?php
/**
 * Ajax methods
 */

namespace App;

$methods = [];

foreach ($methods as $method) {
    add_action('wp_ajax_nopriv_' . $method, 'App\action__' . $method);
    add_action('wp_ajax_' . $method, 'App\action__' . $method);
}

// Ajax methods

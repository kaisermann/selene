<?php

$includes = [
    'src/lib/Sage/Assets/ManifestInterface.php',
    'src/lib/Sage/Assets/JsonManifest.php',
    'src/lib/Sage/Template/WrapperInterface.php',
    'src/lib/Sage/Template/Partial.php',
    'src/lib/Sage/Template/Wrapper.php',
    'src/lib/Sage/Asset.php',
    'src/lib/Sage/Template.php',
    'src/helpers.php',
    'src/setup.php',
    'src/admin.php',
    'src/filters.php',
    'src/ajax.php',
];

// Do not edit anything below this line unless you know what you're doing :)
add_filter('stylesheet', function ($stylesheet) {
    return dirname($stylesheet);
});

add_action('after_switch_theme', function () {
    $stylesheet = get_option('stylesheet');
    if (basename($stylesheet) !== 'templates') {
        update_option('stylesheet', $stylesheet.'/templates');
    }
});

add_action('customize_render_section', function ($section) {
    if ($section->type === 'themes') {
        $section->title = wp_get_theme(basename(__DIR__))->display('Name');
    }
}, 10, 2);

array_walk($includes, function ($file) {
    if (!locate_template($file, true, true)) {
        trigger_error(sprintf(__('Error locating %s for inclusion', 'sage'), $file), E_USER_ERROR);
    }
});

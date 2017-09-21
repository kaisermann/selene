<?php

namespace App;

/**
 * Enqueue 'admin.css' and 'login.css' on login page and dashboard
 */
$adminEnqueueFn = function () {
    wp_enqueue_style(
        'selene/dashboard-login.css',
        asset_path('styles/dashboard-login.css'),
        false,
        null
    );
};
add_action('admin_enqueue_scripts', $adminEnqueueFn, 100);
add_action('login_enqueue_scripts', $adminEnqueueFn, 100);

/**
 * Add option to crop large and medium thumbnail sizes.
 */
add_action('admin_init', function () {
    function crop_settings_callback($size)
    {
        return function () use ($size) {
            echo "<input
                name=\"{$size}_crop\"
                type=\"checkbox\"
                id=\"{$size}_crop\"
                value=\"1\"
                " . (intval(get_option("{$size}_crop")) === 1 ? ' checked' : '') . "/>
                <label for=\"{$size}_crop\">Crop '{$size}' to exact dimensions</label>";
        };
    }

    /** Add the section to media settings */
    add_settings_section(
        'crop_settings_section',
        'Crop images',
        function () {
            echo '<p>Choose whether to crop the medium and large size images</p>';
        },
        'media'
    );

    /** Add the fields to the new section */
    add_settings_field(
        'medium_crop',
        'Medium size crop',
        crop_settings_callback('medium'),
        'media',
        'crop_settings_section'
    );

    add_settings_field(
        'large_crop',
        'Large size crop',
        crop_settings_callback('large'),
        'media',
        'crop_settings_section'
    );

    register_setting('media', 'medium_crop');
    register_setting('media', 'large_crop');
});

/**
 * Remove unused dashboard menu items
 */
/*
add_action('admin_menu', function () {
    remove_menu_page( 'edit-comments.php' );
    remove_submenu_page( 'options-general.php', 'options-writing.php' );
    remove_submenu_page( 'options-general.php', 'options-discussion.php' );
});
*/

/**
 * Set login page logo redirecting to home url
 */
add_filter('login_headerurl', function () {
    return get_home_url();
});

/**
 * Edit the admin left footer text
 */
/*
add_filter('admin_footer_text', function () {
    echo 'Thanks for using WordPress.';
}, 11);
*/

/**
 * Edit the admin right footer text
 */
/*
add_filter('update_footer', function ($wp_version) {
    return '' . $wp_version;
}, 11, 1);
*/

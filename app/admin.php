<?php

namespace App;

/** Display svg correctly on the dashboard */
if(method_exists('\PressBits\MediaLibrary\ScalableVectorGraphicsDisplay', 'enable')) {
    \PressBits\MediaLibrary\ScalableVectorGraphicsDisplay::enable();
}

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

/*
 * If WP_ENV is set, append the environment name to the admin bar for current environment clarity.
 */
if (defined('WP_ENV')) {
    add_action('admin_bar_menu', function ($wp_admin_bar) {
        $env = strtolower(WP_ENV);
        $wp_admin_bar->add_node([
            'id'    => 'current_env',
            'title' => __('Environment', 'selene') . ': '. ucfirst($env),
            'meta'  => ['class' => 'admin-bar__current-env is-'.$env],
            'parent' => 'top-secondary',
        ]);
    }, 999);

    $adminbarCustomStylFn = function () {
        echo '<style>#wpadminbar .admin-bar__current-env .ab-item{color:#fff!important;background-color: #90250b!important}#wpadminbar .admin-bar__current-env[class*="is-staging"] .ab-item{background-color: #ae7100!important}#wpadminbar .admin-bar__current-env[class*="is-dev"] .ab-item{background-color: #307253!important}</style>';
    };

    add_action('admin_head', $adminbarCustomStylFn);
    if (!is_admin() && is_user_logged_in()) {
        add_action('wp_head', $adminbarCustomStylFn);
    }
}

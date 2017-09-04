<?php

namespace App;

/*
 * Remove default dashboard metaboxes
 */
add_action('wp_dashboard_setup', function () {
    remove_action('welcome_panel', 'wp_welcome_panel');
    remove_meta_box('dashboard_primary', 'dashboard', 'normal');
    remove_meta_box('dashboard_secondary', 'dashboard', 'normal');
    remove_meta_box('dashboard_incoming_links', 'dashboard', 'normal');
    remove_meta_box('dashboard_quick_press', 'dashboard', 'side');
    remove_meta_box('dashboard_recent_drafts', 'dashboard', 'side');
});

/*
 * Remove WP logo and comments menu from admin bar
 */
add_action('admin_bar_menu', function ($wp_admin_bar) {
    $wp_admin_bar->remove_node('wp-logo');
    $wp_admin_bar->remove_node('view-site');
    $wp_admin_bar->remove_menu('customize');
    $wp_admin_bar->remove_menu('comments');
}, 100);

/*
 * Move Yoast SEO metabox to a lower position
 */
add_filter('wpseo_metabox_prio', function () {
    return 'low';
});

/*
 * Remove the "help" section on top of admin pages
 */
add_filter('contextual_help', function ($old_help, $screen_id, $screen) {
    $screen->remove_help_tabs();
    return $old_help;
}, 11, 3);

/*
 * Remove emojis, clean up the <head> and remove WP default gallery style
 */
add_action('init', function () {
    /** Remove emojis */
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    add_filter('emoji_svg_url', '__return_false');
    add_filter('tiny_mce_plugins', function ($plugins) {
        return is_array($plugins) ? array_diff($plugins, ['wpemoji']) : [];
    });

    /** Clean the <head> */
    remove_action('wp_head', 'adjacent_posts_rel_link_wp_head', 10);
    remove_action('wp_head', 'feed_links_extra', 3);
    remove_action('wp_head', 'feed_links', 2);
    remove_action('wp_head', 'index_rel_link');
    remove_action('wp_head', 'parent_post_rel_link', 10);
    remove_action('wp_head', 'rel_canonical', 10);
    remove_action('wp_head', 'rest_output_link_wp_head', 10);
    remove_action('wp_head', 'rsd_link');
    remove_action('wp_head', 'start_post_rel_link', 10);
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
    remove_action('wp_head', 'wp_oembed_add_host_js');
    remove_action('wp_head', 'wp_shortlink_wp_head', 10);

    /** Remove default gallery style */
    add_filter('use_default_gallery_style', '__return_false');
});

/*
 * Remove recent comment styles from <head>
 */
add_action('widgets_init', function () {
    global $wp_widget_factory;
    if (isset($wp_widget_factory->widgets['WP_Widget_Recent_Comments'])) {
        remove_action(
            'wp_head',
            [
                $wp_widget_factory->widgets['WP_Widget_Recent_Comments'],
                'recent_comments_style',
            ]
        );
    }
});

/*
 * Remove WP version from the <head> and RSS feeds
 */
add_filter('the_generator', '__return_false');

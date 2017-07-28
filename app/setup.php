<?php

namespace App;

use Roots\Sage\Container;
use Roots\Sage\Assets\JsonManifest;
use Roots\Sage\Template\Blade;
use Roots\Sage\Template\BladeProvider;

// Actions
add_action('init', 'App\\action__init', 0, 2);
add_action('after_setup_theme', 'App\\action__sage_setup', 100);
add_action('after_setup_theme', 'App\\action__after_setup_theme', 100);
add_action('wp_enqueue_scripts', 'App\\action__wp_enqueue_scripts', 100);
add_action('widgets_init', 'App\\action__widgets_init');
add_action('the_post', 'App\\action__the_post');

// Cleanup actions
add_action('init', 'App\\action__cleanup_head');
add_action('widgets_init', 'App\\action__cleanup_widgets');
add_filter('the_generator', '__return_false');

/**
 * Setup Sage options
 */
function action__sage_setup()
{
    /**
    * Add JsonManifest to Sage container
    */
    sage()->singleton(
        'sage.assets',
        function () {
            return new JsonManifest(
                config('assets.manifest'),
                config('assets.uri')
            );
        }
    );

    /**
    * Add Blade to Sage container
    */
    sage()->singleton(
        'sage.blade',
        function (Container $app) {
            $cachePath = config('view.compiled');
            if (! file_exists($cachePath)) {
                wp_mkdir_p($cachePath);
            }
            (new BladeProvider($app))->register();
            return new Blade($app['view']);
        }
    );

    $sageCompiler = sage('blade')->compiler();
    foreach (config('directives') as $directive => $fn) {
        $sageCompiler->directive($directive, $fn);
    }
}

function action__init()
{
    global $wp_rewrite;

    add_image_sizes();
    add_post_types();
    add_taxonomies();

    $wp_rewrite->search_base = 'search';
}

function action__after_setup_theme()
{
    load_theme_textdomain('selene', get_template_directory() . '/languages');
    add_theme_support('html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ]);
    add_theme_support('menus');
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    //add_theme_support('woocommerce');

    add_post_type_support('page', 'excerpt');

    add_editor_style(asset_path('styles/editor.css'));

    register_nav_menus(
        [
            'primary_navigation' => __('Primary Navigation', 'selene'),
        ]
    );
}

function action__wp_enqueue_scripts()
{
    wp_enqueue_style('selene/main.css', asset_path('styles/main.css'), false, null);
    wp_enqueue_script('selene/main.js#defer', asset_path('scripts/main.js'), [], null, true);

    wp_localize_script(
        'selene/main.js#defer',
        'appMeta',
        [
            'homeUrl' => get_bloginfo('url'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
        ]
    );
}

function action__widgets_init()
{
    $config = [
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget' => '</section>',
        'before_title' => '<h3>',
        'after_title' => '</h3>',
    ];

    register_sidebar(
        [
            'name' => __('Main', 'selene'),
            'id' => 'sidebar-main',
        ] + $config
    );

    register_sidebar(
        [
            'name' => __('Footer', 'selene'),
            'id' => 'sidebar-footer',
        ] + $config
    );
}

function action__the_post($post)
{
    sage('blade')->share('post', $post);
}

function action__cleanup_head()
{
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_action('wp_head', 'adjacent_posts_rel_link_wp_head', 10);
    remove_action('wp_head', 'feed_links_extra', 3);
    remove_action('wp_head', 'feed_links', 2);
    remove_action('wp_head', 'index_rel_link');
    remove_action('wp_head', 'parent_post_rel_link', 10);
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_head', 'rel_canonical', 10);
    remove_action('wp_head', 'rest_output_link_wp_head', 10);
    remove_action('wp_head', 'rsd_link');
    remove_action('wp_head', 'start_post_rel_link', 10);
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
    remove_action('wp_head', 'wp_oembed_add_host_js');
    remove_action('wp_head', 'wp_shortlink_wp_head', 10);
    remove_action('wp_print_styles', 'print_emoji_styles');

    // Remove emojis and default gallery style
    add_filter('use_default_gallery_style', '__return_false');
    add_filter('emoji_svg_url', '__return_false');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
}

function action__cleanup_widgets()
{
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
}

// Helpers
function add_image_sizes()
{
}

// https://github.com/johnbillion/extended-cpts/wiki
require_once __DIR__.'/../vendor/johnbillion/extended-cpts/extended-cpts.php';
function add_post_types()
{
    /*
    register_extended_post_type('article', [], [
        'singular' => 'Article',
        'plural'   => 'Articles',
        'slug'     => 'article',
    ]);
    */
}

// https://github.com/johnbillion/extended-taxos
require_once __DIR__.'/../vendor/johnbillion/extended-taxos/extended-taxos.php';
function add_taxonomies()
{
    /*
    register_extended_taxonomy( 'article_category', 'article' , [], [
        'singular' => 'Article Category',
        'plural'   => 'Article Categories',
        'slug'     => 'article-category',
    ]);
    */
}

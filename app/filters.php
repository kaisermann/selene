<?php

namespace App;

// Beginning of Sage filters
add_filter('template_include', 'App\filter__template_include', PHP_INT_MAX);
add_filter('comments_template', 'App\filter__comments_template');
add_filter('body_class', 'App\filter__body_class');

// Beginning of Selene filters
// Pretty search and redirects
add_filter('template_redirect', 'App\filter__template_redirect');
add_filter('wpseo_json_ld_search_url', 'App\filter__wpseo_json_ld_search_url');
add_filter('get_search_form', 'App\filter__get_search_form');
// Default jpg quality
add_filter('jpeg_quality', 'App\filter__jpeg_quality');
// Defer scripts
add_filter('script_loader_tag', 'App\filter__defer_scripts', 10, 2);
// Allows svg to be uploaded as media
add_filter('upload_mimes', 'App\filter__upload_mimes');
// Wraps oembeds with 'embed'
add_filter('embed_oembed_html', 'App\filter__embed_oembed_html');
// Asset versioning
add_filter('style_loader_src', 'App\filter__parse_asset_version');
add_filter('script_loader_src', 'App\filter__parse_asset_version');
// Removes the protocol (http(s)) from asset's url
// Based on 'https://github.com/ryanjbonnell/Protocol-Relative-Theme-Assets by Ryan J. Bonnell'
add_filter('style_loader_src', 'App\filter__url_protocol', 10, 2);
add_filter('script_loader_src', 'App\filter__url_protocol', 10, 2);
add_filter('template_directory_uri', 'App\filter__url_protocol', 10, 3);
add_filter('stylesheet_directory_uri', 'App\filter__url_protocol', 10, 3);
// Removes WP version from RSS feeds
add_filter('the_generator', '__return_false');

/**
* Template Hierarchy should search for .blade.php files
*/
collect(
    [
        'index',
        '404',
        'archive',
        'author',
        'category',
        'tag',
        'taxonomy',
        'date',
        'home',
        'frontpage',
        'page',
        'paged',
        'search',
        'single',
        'singular',
        'attachment',
    ]
)->map(
    function ($type) {
        add_filter("{$type}_template_hierarchy", __NAMESPACE__ . '\\filter_templates');
    }
);

/**
* Render page using Blade
*/
function filter__template_include($template)
{
    $classes = get_body_class();
    array_unshift($classes, 'app');
    $data = collect($classes)->reduce(
        function ($data, $class) use ($template) {
            return apply_filters("sage/template/{$class}/data", $data, $template);
        },
        []
    );
    if ($template) {
        echo template($template, $data);
        return get_stylesheet_directory() . '/index.php';
    }
    return $template;
}

function filter__comments_template($comments_template)
{
    $comments_template = str_replace(
        [ get_stylesheet_directory(), get_template_directory() ],
        '',
        $comments_template
    );

    return template_path(
        locate_template([ "views/{$comments_template}", $comments_template ])
        ?: $comments_template
    );
}

function filter__body_class(array $classes)
{

    // String patterns to remove
    $excludePatterns = [
        'page-template-views.*',        // Removes page-template-views-$template
        'page-id-.*',                               // Removes page-id-$id
        'post-template.*',                  // Removes post-template-$template
        'postid.*',                                 // Removes postid$id
        'single-format.*',                  // Removes single-format-$format
        'category-\d*',                         // Removes category-$id
        'tag-\d*',                                  // Removes tag-$id,
        'post-type-archive',                // Removes post-type-archive
    ];

    // Regex patterns to replace class names
    $replacePatterns = [
        '/page-template-template-(.*)-blade/' => 'template-$1', // Simplifies template classes
        '/page-template(.*)/' => 'template$1',
        '/post-type-archive-(.*)/' => 'archive-$1', // Simplifies custom-post-type-archive
    ];

    // Add post/page slug if not present
    if (is_single() || is_page() && ! is_front_page()) {
        if (! in_array(basename(get_permalink()), $classes)) {
            $classes[] = 'page-' . basename(get_permalink());
        }
    }

    // Remove unnecessary classes
    $classes = preg_grep('/^(?!(' . implode('|', $excludePatterns) . ')$)/xs', $classes);
    $classes = preg_replace(
        array_keys($replacePatterns),
        array_values($replacePatterns),
        $classes
    );

    return $classes;
}

function filter__defer_scripts($tag, $handle)
{
    if (strpos($handle, '#defer') !== false) {
        return str_replace('src', 'defer="defer" src', $tag);
    }
    return $tag;
}

function filter__template_redirect()
{
    global $wp_rewrite;
    if (! isset($wp_rewrite) || ! is_object($wp_rewrite) || ! $wp_rewrite->using_permalinks()) {
        return;
    }

    $search_base = $wp_rewrite->search_base;
    if (is_search() &&
        ! is_admin() &&
        strpos($_SERVER['REQUEST_URI'], "/{$search_base}/") === false &&
        strpos($_SERVER['REQUEST_URI'], '&') === false
    ) {
        wp_redirect(get_search_link());
        exit();
    }
    if (strtoupper(WP_ENV) === 'DEVELOPMENT' && isset($_GET['show_sitemap'])) {
        $home_url = get_home_url();
        $blog_url = get_permalink(get_option('page_for_posts'));
        $the_query = new \WP_Query(
            [
                'post_type' => 'any',
                'posts_per_page' => '-1',
                'post_status' => 'publish',
            ]
        );

        $urls = [];
        $urls[] = $home_url;
        if (strcmp($blog_url, $home_url) !== 0) {
            $urls[] = $blog_url;
        }

        $urls[] = $home_url . '/404';

        while ($the_query->have_posts()) {
            $the_query->the_post();
            $urls[] = get_permalink();
        }
        die(wp_json_encode($urls));
    }
}

function filter__wpseo_json_ld_search_url($url)
{
    global $wp_rewrite;
    return str_replace('/?s=', "/{$wp_rewrite->search_base}/", $url);
}

function filter__get_search_form()
{
    render_component('SearchForm');
    return '';
}

function filter__jpeg_quality()
{
    return 100;
}

function filter__upload_mimes($mimes)
{
    $mimes['svg'] = 'image/svg+xml';
    return $mimes;
}

function filter__embed_oembed_html($cache)
{
    return "<div class=\"embed\">{$cache}</div>";
}

function filter__parse_asset_version($src)
{
    if (WP_DEBUG || strtoupper(WP_ENV) === 'DEVELOPMENT') {
        return add_query_arg('ver', rand(), remove_query_arg('ver', $src));
    }
    return $src;
}

function filter__url_protocol($url)
{
    return preg_replace('(https?://)', '//', $url);
}

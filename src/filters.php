<?php

namespace App;

use Roots\Sage\Template;
use Roots\Sage\Template\Wrapper;

// Sage: filter to display or hide the sidebar
add_filter('template_include', __NAMESPACE__.'\filter__template_include', 109);
add_filter('sage/display_sidebar', __NAMESPACE__.'\filter__display_sidebar');
add_filter('body_class', __NAMESPACE__.'\filter__body_class');
add_filter('template_redirect', __NAMESPACE__.'\filter__template_redirect');
add_filter('get_search_form', __NAMESPACE__.'\filter__get_search_form');
// Default jpg quality
add_filter('jpeg_quality', __NAMESPACE__.'\filter__jpeg_quality');
// Removes WP version from feeds
add_filter('the_generator', __NAMESPACE__.'\filter__the_generator');
// Removes the protocol (http(s)) from asset's url
// Based on 'https://github.com/ryanjbonnell/Protocol-Relative-Theme-Assets by Ryan J. Bonnell'
add_filter('style_loader_src', __NAMESPACE__.'\filter__style_loader_src', 10, 2);
add_filter('script_loader_src', __NAMESPACE__.'\filter__script_loader_src', 10, 2);
add_filter('template_directory_uri', __NAMESPACE__.'\filter__template_directory_uri', 10, 3);
add_filter('stylesheet_directory_uri', __NAMESPACE__.'\filter__stylesheet_directory_uri', 10, 3);

function filter__template_include($main)
{
    if (!is_string($main) && !(is_object($main) && method_exists($main, '__toString'))) {
        return $main;
    }

    return (new Template(new Wrapper($main)))->layout();
}

// Modify this method's result to show or hide the sidebar
function filter__display_sidebar($display)
{
    // The sidebar will NOT be displayed if ANY of the following return true
    return $display ? !in_array(true, [
      is_404(),
      is_front_page(),
    ]) : $display;
}

function filter__body_class($classes)
{
    if (is_single() || is_page() && !is_front_page()) {
        $baseName = basename(get_permalink());
        if (!in_array($baseName, $classes)) {
            $classes[] = $baseName;
        }
    }

    if (display_sidebar()) {
        $classes[] = 'has-sidebar';
    }

    return $classes;
}

function filter__template_redirect()
{
    global $wp_rewrite;
    if (!isset($wp_rewrite) || !is_object($wp_rewrite) || !$wp_rewrite->using_permalinks()) {
        return;
    }

    $search_base = $wp_rewrite->search_base;
    if (is_search() && !is_admin() && strpos($_SERVER['REQUEST_URI'], '/'.$search_base.'/') === false) {
        wp_redirect(home_url('/'.$search_base.'/'.urlencode(get_query_var('s'))));
        exit();
    }
}

function filter__get_search_form()
{
    $form = '';
    locate_template('/templates/partials/searchform.php', true, false);

    return $form;
}

function filter__jpeg_quality()
{
    return 100;
}

function filter__the_generator()
{
    return '';
}

function filter__style_loader_src($src)
{
    return getUrlWithRelativeProtocol($src);
}

function filter__script_loader_src($src)
{
    return getUrlWithRelativeProtocol($src);
}

function filter__template_directory_uri($template_dir_uri)
{
    return getUrlWithRelativeProtocol($template_dir_uri);
}

function filter__stylesheet_directory_uri($stylesheet_dir_uri)
{
    return getUrlWithRelativeProtocol($stylesheet_dir_uri);
}

// Helpers
function getUrlWithRelativeProtocol($url)
{
    return preg_replace('(https?://)', '//', $url);
}

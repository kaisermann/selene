<?php

namespace App;

use Roots\Sage\Asset;
use Roots\Sage\Assets\JsonManifest;
use Roots\Sage\Template;

function template($layout = 'base')
{
    return Template::$instances[$layout];
}

function template_part($template, array $context = [], $layout = 'base')
{
    extract($context);
    include template($layout)->partial($template);
}

function asset_path($filename)
{
    static $manifest;
    isset($manifest) || $manifest = new JsonManifest(get_template_directory().'/'.Asset::$dist.'/assets.json');

    return (string) new Asset($filename, $manifest);
}

function display_sidebar()
{
    static $display;
    isset($display) || $display = apply_filters('sage/display_sidebar', true);

    return $display;
}

function title()
{
    if (is_home()) {
        if ($home = get_option('page_for_posts', true)) {
            return get_the_title($home);
        }

        return __('Latest Posts', 'sepha');
    }

    if (is_archive()) {
        return get_the_archive_title();
    }

    if (is_search()) {
        return sprintf(__('Search Results for %s', 'sepha'), get_search_query());
    }

    if (is_404()) {
        return __('Not Found', 'sepha');
    }

    return get_the_title();
}

function debug($data, $phpPrint = false, $onlyLogged = true)
{
    if (!$onlyLogged || is_user_logged_in()) {
        if ($phpPrint) {
            echo '<pre style="white-space: pre-wrap;">';
            ob_start();
            var_dump($data);
            echo htmlspecialchars(ob_get_clean());
            echo '</pre>';
        } else {
            echo '<script>console.log('.((is_array($data) || is_object($data)) ? json_encode($data) : $data).');</script>';
        }
    }
}

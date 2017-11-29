<?php
/*
 * Controllers documentation: https://github.com/soberwp/controller
 */

namespace App;

use Sober\Controller\Controller;

class App extends Controller
{

    /**
     * Site name
     * @return string
     */
    public function siteName()
    {
        return get_bloginfo('name');
    }

    /**
     * Current template file name
     * @return string
     */
    public function currentTemplate()
    {
        global $template;
        return basename($template, '.blade.php');
    }

    /**
     * Returns the primary navigation menu if available
     * @return string
     */
    public function primaryMenu()
    {
        if (has_nav_menu('primary_navigation')) {
            return wp_nav_menu(
                [
                    'theme_location' => 'primary_navigation',
                    'walker' => new \BEM\MenuWalker,
                    'block' => 'header__menu',
                    'menu_class' => 'header__menu',
                    'container' => 'nav',
                    'container_class' => 'app__nav',
                    'echo' => false,
                ]
            );
        }
        return '[no-primary-navigation]';
    }

    /**
     * Page titles
     * @return string
     */
    public static function title()
    {
        if (is_home()) {
            if ($home = get_option('page_for_posts', true)) {
                return get_the_title($home);
            }
            return __('Latest Posts', 'selene');
        }
        if (is_archive()) {
            return get_the_archive_title();
        }
        if (is_search()) {
            return sprintf(__('Search Results for %s', 'selene'), get_search_query());
        }
        if (is_404()) {
            return __('Not Found', 'selene');
        }
        return get_the_title();
    }
}

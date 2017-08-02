<?php

$fn_end_while = function () {
    return '<?php endwhile; wp_reset_query(); ?>';
};

return [
    /*
    |--------------------------------------------------------------------------
    | Directives
    |--------------------------------------------------------------------------
    |
    | List here your custom directives
    |
    */

    /** Create @asset() Blade directive */
    'asset' => function ($asset) {
        return "<?php echo App\asset_path({$asset}); ?>";
    },

    /** Creates @mainquery Blade directive */
    'mainquery' => function () {
        return '<?php while(have_posts()) : the_post(); ?>';
    },

    /** Creates @endmainquery Blade directive */
    'endmainquery' => $fn_end_while,

    /** Creates @customquery(\WP_Query $query_obj) Blade directive */
    'customquery' => function ($query_obj) {
        $output = "<?php while ({$query_obj}->have_posts()) : ?>";
        $output .= "<?php {$query_obj}->the_post(); ?>";
        return $output;
    },

    /** Creates @endcustomquery Blade directive */
    'endcustomquery' => $fn_end_while,

    /** Create @shortcode($shortCodeString) Blade directive */
    'shortcode' => function ($shortcode) {
        return "<?php echo do_shortcode({$shortcode}); ?>";
    },

    /** Create @inlinesvg() Blade directive */
    'inlinesvg' => function ($path) {
        return "<?php App\get_svg({$path}, true); ?>";
    },

    /** Create @dump($obj) Blade directive */
    'dump' => function ($obj) {
        return "<?php App\dump({$obj}, true); ?>";
    },

    /** Create @console($obj) Blade directive */
    'console' => function ($obj) {
        return "<?php App\dump({$obj}, false); ?>";
    },

    /** Create @set($name, value) Blade directive */
    'set' => function ($expression) {
        list($variable, $value) = explode(', ', $expression, 2);

        /** Ensure variable has no spaces or apostrophes */
        $variable = trim(str_replace('\'', '', $variable));

        /** Make sure that the variable starts with $ */
        if (! starts_with($variable, '$')) {
            $variable = '$' . $variable;
        }
        $value = trim($value);
        return "<?php {$variable} = {$value}; ?>";
    },
];

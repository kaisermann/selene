<?php

namespace App;

add_action( 'after_setup_theme', function() {

	// Helpers
	$sageCompiler = sage( 'blade' )->compiler();
	$fnEndWhile = function () { return '<?php endwhile; wp_reset_query(); ?>'; };

	// Create @asset() Blade directive
	$sageCompiler->directive('asset', function ( $asset ) {
		return "<?php echo " . __NAMESPACE__ . "\\asset_path({$asset}); ?>";
	});

	// Create @asset() Blade directive
	$sageCompiler->directive('inlinesvg', function ( $path ) {
		return "<?php " . __NAMESPACE__ . "\\getSVG({$path}, true); ?>";
	});

	// Creates @posts Blade directive
	$sageCompiler->directive( 'mainquery', function () {
		return '<?php while(have_posts()) : the_post(); ?>';
	} );

	// Creates @endposts Blade directive
	$sageCompiler->directive( 'endmainquery', $fnEndWhile );

	// Creates @customquery(\WP_Query $queryObj) Blade directive
	$sageCompiler->directive('customquery', function( $queryObj ) {
		$output = "<?php while ({$queryObj}->have_posts()) : ?>";
		$output .= "<?php {$queryObj}->the_post(); ?>";
		return $output;
	});

	// Creates @endcustomquery Blade directive
	$sageCompiler->directive( 'endcustomquery', $fnEndWhile );

	// Create @dump($obj) Blade directive
	$sageCompiler->directive('dump', function ( $obj ) {
		return "<?php " . __NAMESPACE__ . "\\dump({$obj}, true); ?>";
	});

	// Create @console($obj) Blade directive
	$sageCompiler->directive('console', function ( $obj ) {
		return "<?php " . __NAMESPACE__ . "\\dump({$obj}, false); ?>";
	});

	// Create @shortcode($shortCodeString) Blade directive
	$sageCompiler->directive('shortcode', function ( $shortcode ) {
		return "<?php echo do_shortcode({$shortcode}); ?>";
	});
}, 100 );

<?php

namespace App;

add_action( 'after_setup_theme', function() {

	// Helpers
	$sageCompiler = sage( 'blade' )->compiler();
	$fnEndWhile = function () { return '<?php endwhile; ?>'; };

	// Create @asset() Blade directive
	$sageCompiler->directive('asset', function ( $asset ) {
		return '<?php echo App\\asset_path(\'' . trim( $asset, '\'"' ) . '\'); ?>';
	});

	// Creates @posts Blade directive
	$sageCompiler->directive( 'mainquery', function () {
		return '<?php while(have_posts()) : the_post(); ?>';
	} );

	// Creates @endposts Blade directive
	$sageCompiler->directive( 'endmainquery', $fnEndWhile );

	// Creates @customquery(\WP_Query $queryObj) Blade directive
	$sageCompiler->directive('customquery', function( $queryObj ) {
		$output = '<?php while (' . $queryObj . '->have_posts()) : ?>';
		$output .= '<?php ' . $queryObj . '->the_post(); ?>';
		return $output;
	});

	// Creates @endcustomquery Blade directive
	$sageCompiler->directive( 'endcustomquery', $fnEndWhile );

}, 100 );

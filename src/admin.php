<?php

namespace App;

// Actions
add_action( 'customize_register', 'App\\action__customize_register' );
add_action( 'customize_preview_init', 'App\\action__customize_preview_init' );
add_action( 'admin_enqueue_scripts', 'App\\action__admin_enqueue_scripts' );
add_action( 'login_enqueue_scripts', 'App\\action__admin_enqueue_scripts' );
add_action( 'admin_init', 'App\\action__admin_init' );

remove_action( 'welcome_panel', 'wp_welcome_panel' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );

// Filters
add_filter( 'login_headerurl', 'App\\filter__login_headerurl' );

// Action methods

/**
 * Theme customizer
 */
function action__customize_register( \WP_Customize_Manager $wp_customize ) {
	// Add postMessage support
	$wp_customize->get_setting( 'blogname' )->transport = 'postMessage';
	$wp_customize->selective_refresh->add_partial('blogname', [
		'selector' => '.brand',
		'render_callback' => function () {
			bloginfo( 'name' );
		},
	]);
}

/**
 * Customizer JS
 */
function action__customize_preview_init() {
	wp_enqueue_script( 'sepha/customizer.js', asset_path( 'scripts/customizer.js' ), [ 'customize-preview' ], null, true );
};

function action__admin_enqueue_scripts() {
	wp_enqueue_style( 'sepha/admin.css', asset_path( 'styles/admin.css' ), false, null );
}

function action__admin_init() {
	remove_meta_box( 'dashboard_primary', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_secondary', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_incoming_links', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_recent_drafts', 'dashboard', 'side' );
}

// Filter methods
function filter__login_headerurl() {
	return home_url();
}

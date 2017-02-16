<?php

namespace App;

// Actions
// Customizer.js
add_action( 'customize_register', 'App\action__customize_register' );
add_action( 'customize_preview_init', 'App\action__customize_preview_init' );
// Enqueues admin.css on login page and dashboard
add_action( 'admin_enqueue_scripts', 'App\action__admin_enqueue_scripts' );
add_action( 'login_enqueue_scripts', 'App\action__admin_enqueue_scripts' );
// Removes default dashboard metaboxes
add_action( 'admin_init', 'App\action__admin_init' );
// Removes WP logo and comments menu from admin bar
add_action( 'admin_bar_menu','App\action__remove_wp_logo', 100 );

remove_action( 'welcome_panel', 'wp_welcome_panel' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );

// Filters
// Sets login page logo redirecting to home url
add_filter( 'login_headerurl', 'App\filter__login_headerurl' );
// Moves yoast SEO (if available) metabox to a lower position
add_filter( 'wpseo_metabox_prio', 'App\filter__wpseo_metabox_prio' );
// Removes the "help" section on top of admin pages
add_filter( 'contextual_help', 'App\filter__contextual_help', 11, 3 );
// Edits the admin left footer text
// add_filter( 'admin_footer_text',  'App\filter__admin_footer_text', 11);
// Edits the admin right footer text
// add_filter( 'update_footer',  'App\filter__update_footer', 11, 1 );

// Actions
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
function action__customize_preview_init() {
	wp_enqueue_script( 'selene/customizer.js', asset_path( 'scripts/customizer.js' ), [ 'customize-preview' ], null, true );
};

function action__admin_enqueue_scripts() {
	wp_enqueue_style( 'selene/admin.css', asset_path( 'styles/admin.css' ), false, null );
}

function action__admin_init() {
	remove_meta_box( 'dashboard_primary', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_secondary', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_incoming_links', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_recent_drafts', 'dashboard', 'side' );
}

function action__remove_wp_logo( $wp_admin_bar ) {
	$wp_admin_bar->remove_node( 'wp-logo' );
	$wp_admin_bar->remove_menu( 'comments' );
}

// Filters
function filter__login_headerurl() {
	return get_home_url();
}

function filter__wpseo_metabox_prio() {
	return 'low';
}

function filter__contextual_help( $old_help, $screen_id, $screen ) {
	$screen->remove_help_tabs();
	return $old_help;
}

function filter__admin_footer_text() {
	echo 'Admin Dashboard - <a href="https://wordpress.org/" target="_blank" rel="noopener noreferrer">Wordpress</a>';
}

function filter__update_footer( $wpVersion ) {
	return '' . $wpVersion;
}

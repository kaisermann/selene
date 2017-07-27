<?php

namespace App;

// Actions
// Enqueues admin.css on login page and dashboard
add_action( 'admin_enqueue_scripts', 'App\action__admin_enqueue_scripts', 100 );
add_action( 'login_enqueue_scripts', 'App\action__admin_enqueue_scripts', 100 );

// Removes default dashboard metaboxes
add_action( 'admin_init', 'App\action__admin_init' );
add_action( 'admin_init', 'App\action__default_sizes_crop' );

// Removes WP logo and comments menu from admin bar
add_action( 'admin_bar_menu','App\action__trim_adminbar', 100 );

// Removes some unused dashboard menu items
// add_action( 'admin_menu','App\action__trim_adminmenu' );

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
function action__admin_enqueue_scripts() {
	wp_enqueue_style( 'selene/admin.css', asset_path( 'styles/admin.css' ), false, null );
	wp_enqueue_style( 'selene/login.css', asset_path( 'styles/login.css' ), false, null );
}

function action__admin_init() {
	remove_meta_box( 'dashboard_primary', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_secondary', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_incoming_links', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_recent_drafts', 'dashboard', 'side' );
}

function action__default_sizes_crop() {
	// Add the section to media settings
	add_settings_section(
		'crop_settings_section',
		'Crop images',
		function () { echo '<p>Choose whether to crop the medium and large size images</p>'; },
		'media'
	);
	// Add the fields to the new section
	add_settings_field(
		'medium_crop',
		'Medium size crop',
		crop_settings_callback('medium'),
		'media',
		'crop_settings_section'
	);
	add_settings_field(
		'large_crop',
		'Large size crop',
		crop_settings_callback('large'),
		'media',
		'crop_settings_section'
	);
	register_setting( 'media', 'medium_crop' );
	register_setting( 'media', 'large_crop' );
}

function action__trim_adminbar( $wp_admin_bar ) {
	$wp_admin_bar->remove_node( 'wp-logo' );
	$wp_admin_bar->remove_node( 'view-site' );
	$wp_admin_bar->remove_menu( 'customize' );
	$wp_admin_bar->remove_menu( 'comments' );
}

function action__trim_adminmenu() {
	// remove_menu_page( 'edit-comments.php' );
	// remove_submenu_page( 'options-general.php', 'options-writing.php' );
	// remove_submenu_page( 'options-general.php', 'options-discussion.php' );
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
	echo 'Thanks for using WordPress.';
}

function filter__update_footer( $wpVersion ) {
	return '' . $wpVersion;
}

// Helpers

// Callback function for our medium crop setting
function crop_settings_callback( $size ) {
	return function() use ( $size ) {
		echo "<input
			name=\"{$size}_crop\"
			type=\"checkbox\"
			id=\"{$size}_crop\"
			value=\"1\"
			" . (get_option( "{$size}_crop" ) == 1 ? ' checked' : '') . "/>";
		echo "<label for=\"{$size}_crop\">Crop {$size} to exact dimensions</label>";
	};
}

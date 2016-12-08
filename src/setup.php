<?php
namespace App;

use Roots\Sage\Assets\JsonManifest;
use Roots\Sage\Template\BladeProvider;

// Actions
add_action( 'init', 'App\\action__init', 0, 2 );
add_action( 'after_setup_theme', 'App\\action__after_setup_theme' );
add_action( 'wp_enqueue_scripts', 'App\\action__wp_enqueue_scripts' );
add_action( 'widgets_init', 'App\\action__widgets_init' );

remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'feed_links_extra', 3 );
remove_action( 'wp_head', 'feed_links', 2 );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'index_rel_link' );
remove_action( 'wp_head', 'parent_post_rel_link', 10, 0 );
remove_action( 'wp_head', 'start_post_rel_link', 10, 0 );
remove_action( 'wp_head', 'rel_canonical', 10, 0 );
remove_action( 'wp_head', 'wp_shortlink_wp_head', 10, 0 );
remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0 );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

/**
 * Add JsonManifest to Sage container
 */
sage()->singleton('sage.assets', function () {
	return new JsonManifest(
		get_stylesheet_directory() . '/dist/assets.json',
		get_stylesheet_directory_uri() . '/dist'
	);
});

/**
 * Add Blade to Sage container
 */
sage()->singleton('sage.blade', function () {
	$cachePath = wp_upload_dir()['basedir'] . '/cache/compiled';
	if ( ! file_exists( $cachePath ) ) {
		wp_mkdir_p( $cachePath );
	}
	return new BladeProvider( TEMPLATEPATH, $cachePath, sage() );
});

/**
 * Create @asset() Blade directive
 */
sage( 'blade' )->compiler()->directive('asset', function ( $asset ) {
	return '<?php echo App\\asset_path(\'' . trim( $asset, '\'"' ) . '\'); ?>';
});

function action__init() {

	global $wp_rewrite;

	add_image_sizes();
	add_post_types();
	add_taxonomies();

	$wp_rewrite->search_base = 'search';
}

function action__after_setup_theme() {
	load_theme_textdomain( 'sepha', get_template_directory() . '/languages' );
	add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ] );
	add_theme_support( 'menus' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	//add_theme_support('post-formats', ['aside', 'gallery', 'link', 'image', 'quote', 'status', 'video', 'audio', 'chat']);
	//add_theme_support('woocommerce');

	add_post_type_support( 'page', 'excerpt' );

	add_editor_style( asset_path( 'styles/editor.css' ) );

	register_nav_menus([
		'main_nav' => __( 'Main Navigation', 'sepha' ),
		]
	);
}
function action__wp_enqueue_scripts() {
	global $post;

	if ( ! is_admin() ) {
		wp_deregister_script( 'jquery' );
		wp_register_script( 'jquery', ('https://code.jquery.com/jquery-3.1.1.min.js'), false, '3.1.1', true );
		wp_enqueue_script( 'jquery' );
	}

	wp_enqueue_style( 'sepha/main.css', asset_path( 'styles/main.css' ), false, null );
	wp_enqueue_script( 'sepha/main.js', asset_path( 'scripts/main.js' ), [ 'jquery' ], null, true );

	wp_localize_script('sepha/main.js', 'appMeta', [
	  	'homeUrl' => get_bloginfo( 'url' ),
	  	'ajaxUrl' => admin_url( 'admin-ajax.php' ),
	]);
}
function action__widgets_init() {
	$config = [
		 'before_widget' => '<section class="widget %1$s %2$s">',
		 'after_widget' => '</section>',
		 'before_title' => '<h3>',
		 'after_title' => '</h3>',
		];
	register_sidebar(
		[
		 'name' => __( 'Main', 'sepha' ),
		 'id' => 'sidebar-main',
		] + $config
	);
	register_sidebar(
		[
		 'name' => __( 'Footer', 'sepha' ),
		 'id' => 'sidebar-footer',
		] + $config
	);
}
// Helpers
function add_image_sizes() {
}

function add_post_types() {
}

function add_taxonomies() {
}

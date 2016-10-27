<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<?php get_template_part( 'partials/head' ); ?>
<body <?php body_class(); ?>>
	<?php
	do_action( 'get_header' );
	get_template_part( 'partials/header' );
	?>
	<div class="page__container" role="document">
		<div class="page__content">
			<main class="main" role="main">
				<?php include App\template()->main(); ?>
			</main>
			<?php if ( App\display_sidebar() ) : ?>
				<aside class="sidebar" role="complementary">
					<?php App\template_part( 'partials/sidebar' ); ?>
				</aside>
			<?php endif; ?>
		</div>
	</div>
	<?php
	do_action( 'get_footer' );
	get_template_part( 'partials/footer' );
	wp_footer();
	?>
</body>
</html>

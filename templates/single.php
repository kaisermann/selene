<?php while (have_posts()) : the_post(); ?>
	<article <?php post_class(); ?>>
		<header>
			<h1 class="entry__title"><?php the_title(); ?></h1>
			<?php get_template_part('templates/partials/entry-meta.php'); ?>
		</header>
		<div class="entry__content">
			<?php the_content(); ?>
		</div>
		<footer>
			<?php wp_link_pages(['before' => '<nav class="page-nav"><p>' . __('Pages:', 'sepha'), 'after' => '</p></nav>']); ?>
		</footer>
		<?php comments_template('/templates/partials/comments.php'); ?>
	</article>
<?php endwhile; ?>

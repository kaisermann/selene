<header class="header" role="banner">
	<div class="container">
		<a class="brand" href="<?= esc_url(home_url('/')); ?>">
			<?php bloginfo('name'); ?>
		</a>
		<nav role="navigation">
			<?php wp_nav_menu(['theme_location' => 'main_nav', 'menu_class' => 'nav']); ?>
		</nav>
	</div>
</header>

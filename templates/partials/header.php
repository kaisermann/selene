<header class="header">
	<?php wp_nav_menu( [
		'menu_location' => 'main_nav',
		'walker' => new BEM\MenuWalker,
		'block' => 'header__nav',
		'menu_class' => 'header__nav',
		'container' => false,
	] ); ?>
</header>

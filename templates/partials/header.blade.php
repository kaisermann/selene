<header class="header">
		<nav class="header__nav">
			@if (has_nav_menu('main_nav'))
				{!! wp_nav_menu( [
					'menu_location' => 'main_nav',
					'walker' => new BEM\MenuWalker,
					'block' => 'header__menu',
					'menu_class' => 'header__menu',
					'container' => false,
				] ) !!}
			@endif
		</nav>
</header>

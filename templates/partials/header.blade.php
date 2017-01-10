<header class="header">
	<a class="brand" href="{{ home_url('/') }}">{{ get_bloginfo('name', 'display') }}</a>
	<nav class="header__nav nav-primary">
		@if (has_nav_menu('primary_navigation'))
			{!! wp_nav_menu([
				'theme_location' => 'primary_navigation',
				'menu_class' => 'nav',
				'walker' => new BEM\MenuWalker,
				'block' => 'header__menu',
				'menu_class' => 'nav header__menu',
				'container' => false,
			]) !!}
			{!! wp_nav_menu([
				'theme_location' => 'primary_navigation',
				'menu_class' => 'nav',
				'block' => 'header__menu',
				'menu_class' => 'nav header__menu',
				'container' => false,
			]) !!}
		@endif
	</nav>
</header>

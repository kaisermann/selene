<header class="header">
	<a class="brand" href="{{ home_url('/') }}">{{ get_bloginfo('name', 'display') }}</a>
	<nav class="header__nav nav-primary">
		@if (has_nav_menu('primary_navigation'))
			{!! wp_nav_menu($primary_nav_args) !!}
		@endif
	</nav>
</header>

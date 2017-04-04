<header class="header">
    <a class="brand" href="{{ home_url('/') }}">{{ get_bloginfo('name', 'display') }}</a>
    @if (has_nav_menu('primary_navigation'))
			{!! wp_nav_menu($c_primary_nav_args) !!}
    @endif
</header>

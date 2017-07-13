<header class="header js-header">
	<a class="brand" href="{{ home_url('/') }}">{{ $site_name }}</a>

	<input type="checkbox" id="burger-checkbox" class="burger-checkbox">
	<label for="burger-checkbox" class="burger">
		<span class="burger__slices"><span>Toggle Main Menu</span></span>
	</label>

	<div class="af-overlay -hidden-first header__overlay">
		{!! $primary_menu !!}
	</div>
</header>

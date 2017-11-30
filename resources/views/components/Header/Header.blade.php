<header class="header js-header" role="banner">
  <a class="brand" href="{{ home_url('/') }}">{{ $site_name }}</a>

  <button class="burger js-burger" aria-label="Toggle Main Menu" aria-expanded="false" aria-haspopup="true">
    <span class="burger__slices"><span>Toggle Main Menu</span></span>
  </button>

  <div class="header__overlay js-header-overlay">
    {!! $primary_menu !!}
  </div>
</header>

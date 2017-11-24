<header class="header js-header">
  <a class="brand" href="{{ home_url('/') }}">{{ $site_name }}</a>

  <button class="burger js-burger" aria-label="Menu" aria-pressed="false">
    <span class="burger__slices"><span>Toggle Main Menu</span></span>
  </button>

  <div class="header__overlay js-header-overlay">
    {!! $primary_menu !!}
  </div>
</header>

<div class="search-form js-search-form">
    <form role="search" method="get" action="{!! esc_url( home_url( '/' ) ) !!}">
        <input type="search" value="{!! get_search_query() !!}" name="s" class="search-field" placeholder="{{ __( 'Search for', 'selene' ) }}" required>
        <button type="submit" class="search-submit">{{ __( 'Search', 'selene' ) }}</button>
    </form>
</div>

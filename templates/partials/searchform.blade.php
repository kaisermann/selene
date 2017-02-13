<form role="search" method="get" class="search-form" action="{!! esc_url( home_url( '/' ) ) !!}">
	<div class="input-group">
		<input type="search" value="{!! get_search_query() !!}" name="s" class="search-field" placeholder="{{ __( 'Search for', 'selene' ) }}" required>
		<button type="submit" class="search-submit">{{ __( 'Search', 'selene' ) }}</button>
	</div>
</form>

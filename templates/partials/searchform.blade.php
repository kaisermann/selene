<form role="search" method="get" class="search-form" action="{!! esc_url( home_url( '/' ) ) !!}">
	<div class="input-group">
		<input type="search" value="{!! get_search_query() !!}" name="s" class="search-field" placeholder="{{ __( 'Search for', 'sepha' ) }}" required>
		<button type="submit" class="search-submit">{{ __( 'Search', 'sepha' ) }}</button>
	</div>
</form>

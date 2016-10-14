<form role="search" method="get" class="search-form" action="<?php echo esc_url(home_url('/')); ?>">
	<div class="input-group">
		<input type="search" value="<?php echo get_search_query(); ?>" name="s" class="search-field" placeholder="<?php _e('Search for', 'sepha'); ?>" required>
		<button type="submit" class="search-submit"><?php _e('Search', 'sepha'); ?></button>
	</div>
</form>

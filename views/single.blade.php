@extends('layouts.app')

@section('content')
	@mainquery
		<article @php(post_class())>
			<header>
				<h1 class="entry__title">{{ get_the_title() }}</h1>
			</header>
			<div class="entry__content">
				@php(the_content())
			</div>
			<footer>
				{!! wp_link_pages(['before' => '<nav class="page-nav"><p>' . __('Pages:', 'selene'), 'after' => '</p></nav>']) !!}
			</footer>
			@php(comments_template('/views/partials/comments.blade.php'))
		</article>
	@endmainquery
@stop

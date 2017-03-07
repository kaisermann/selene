@extends('layouts.base')

@section('content')
	@while(have_posts())
		@php(the_post())
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
	@endwhile
@endsection

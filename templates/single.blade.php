@extends('layouts.base')

@section('content')
	@while(have_posts())
		@php the_post() @endphp
		<article @php post_class() @endphp>
			<header>
				<h1 class="entry__title">{{ get_the_title() }}</h1>
			</header>
			<div class="entry__content">
				@php the_content() @endphp
			</div>
			<footer>
				{!! wp_link_pages(['before' => '<nav class="page-nav"><p>' . __('Pages:', 'sepha'), 'after' => '</p></nav>']) !!}
			</footer>
			@php comments_template('/templates/partials/comments.blade.php') @endphp
		</article>
	@endwhile
@endsection

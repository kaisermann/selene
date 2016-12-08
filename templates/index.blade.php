@extends('layouts.base')

@section('content')
	@if (!have_posts())
		<div class="alert -warning">
			{{ __('Sorry, no results were found.', 'sepha') }}
		</div>
		{!! get_search_form(false) !!}
	@endif

	@while (have_posts())
		@php the_post() @endphp
		<article @php post_class() @endphp>
			<header>
				<h2 class="entry-title"><a href="{{ get_permalink() }}">{{ get_the_title() }}</a></h2>
			</header>
			<div class="entry-summary">
				@php the_excerpt() @endphp
			</div>
		</article>
	@endwhile

	{!! get_the_posts_navigation() !!}
@endsection

@extends('layouts.base')

@section('content')
	@if (!have_posts())
		<div class="alert alert-warning">
			{{  __('Sorry, no results were found.', 'sage') }}
		</div>
		{!! get_search_form(false) !!}
	@endif

	@mainquery
		<article @php(post_class())>
			<header>
				<h2 class="entry-title"><a href="{{ get_permalink() }}">{{ get_the_title() }}</a></h2>
			</header>
			<div class="entry-summary">
				@php(the_excerpt())
			</div>
		</article>
	@endmainquery

	{!! get_the_posts_navigation() !!}
@endsection

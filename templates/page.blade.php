@extends('layouts.base')

@section('content')
	@while(have_posts())
		@php the_post() @endphp
		@php the_content() @endphp
	@endwhile
@endsection

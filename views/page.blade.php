@extends('layouts.base')

@section('content')
	@while(have_posts())
		@php(the_post())
		@php(the_content())
	@endwhile
@endsection

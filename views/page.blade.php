@extends('layouts.base')

@section('content')
	@mainquery
		@php(the_content())
	@endmainquery
@endsection

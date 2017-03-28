@extends('layouts.app')

@section('content')
	@mainquery
		@php(the_content())
	@endmainquery
@endsection

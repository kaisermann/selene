@extends('layouts.app')

@section('content')
  @if (!have_posts())
    <div class="alert -warning">
      {{ __('404 - Page Not Found', 'selene') }}
    </div>
    {!! get_search_form(false) !!}
  @endif
@stop

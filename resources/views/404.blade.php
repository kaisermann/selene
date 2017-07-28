@extends('layouts.app')

@section('content')
    <div class="alert -warning">
        {{ __('404 - Page Not Found', 'selene') }}
    </div>
    {!! get_search_form(false) !!}
@stop

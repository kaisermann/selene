@extends('layouts.app')

@section('content')
  @mainquery
    <article @php(post_class())>
      <header>
        <h2 class="entry__title">
          <a href="{{ get_permalink() }}">
            {{ get_the_title() }}
          </a>
        </h2>
      </header>
      <div class="entry__summary">
        @php(the_excerpt())
      </div>
    </article>
  @endmainquery
@stop

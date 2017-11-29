<!DOCTYPE html>
<html @php(language_attributes())>
  @include('partials.head')
  <body @php(body_class('app'))>
    <div class="app__wrapper" role="document">
        <div class="app__container">
            @php(do_action('get_header'))
            @include('components.Header.Header')

            <main class="app__main" role="main">
                @yield('content')
            </main>

            @php(do_action('get_footer'))
            @include('components.Footer.Footer')
        </div>
    </div>
    @php(wp_footer())
  </body>
</html>

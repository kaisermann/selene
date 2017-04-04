<!DOCTYPE html>
<html @php(language_attributes())>
	@include('partials.head')
	<body @php(body_class())>
		<div class="page-wrapper" role="document">
			<div class="page-container">
				@php(do_action('get_header'))
				@include('partials.header')
				<div class="page-content">
					<main class="main" role="main">
						@yield('content')
					</main>
				</div>
				@php(do_action('get_footer'))
				@include('partials.footer')
				@php(wp_footer())
			</div>
		</div>
	</body>
</html>

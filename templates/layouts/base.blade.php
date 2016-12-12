<!DOCTYPE html>
<html @php(language_attributes())>
	@include('partials.head')
	<body @php(body_class())>
		<!--[if IE]>
			<div class="alert alert-warning">
				{!! __('You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.', 'sage') !!}
			</div>
		<![endif]-->
		<div class="page-wrapper" role="document">
			<div class="page-container">
				@php(do_action('get_header'))
				@include('partials.header')
				<div class="page-content">
					<main class="main" role="main">
						@yield('content')
					</main>
					@if (App\display_sidebar())
						<aside class="sidebar">
							@include('partials.sidebar')
						</aside>
					@endif
				</div>
				@php(do_action('get_footer'))
				@include('partials.footer')
				@php(wp_footer())
			</div>
		</div>
	</body>
</html>

'use strict';

import Router from './util/router';
import common from './routes/common';

(function ($) {
	// Modify the '_routes' object to include or remove other routes
	const _routes = {
		common
	};

	// Normally, you won't need to modify anything below this line.
	// Useful short aliases
	const _win = window, _doc = document, _body = document.body;
	const _router = new Router(_routes).loadClasses();

	if (_doc.readyState === "interactive" || _doc.readyState === "complete")
		_router.loadEvents();
	else
		_doc.addEventListener("DOMContentLoaded", function loadListener() {
			_doc.removeEventListener("DOMContentLoaded", loadListener, false);
			_router.loadEvents();
		}, false);
})(window.jQuery || window.Zepto || window.Cash || undefined);

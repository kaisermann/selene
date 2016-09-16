'use strict';

import Router from './util/router';
import common from './Routes/common';

(function ($) {
	let w = window, d = document, PAGE_PARAMS;

	const routes = {
		common
	};

	if (d.readyState === "interactive" || d.readyState === "complete")
		new Router(routes).loadEvents();
	else
		d.addEventListener("DOMContentLoaded", function loadListener() {
			d.removeEventListener("DOMContentLoaded", loadListener, false);
			new Router(routes).loadEvents();
		}, false);
})(window.jQuery || window.Zepto || window.Cash || undefined);

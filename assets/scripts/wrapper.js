'use strict';

(function ($) {
	let w = window, d = document, PAGE_PARAMS;

	// @include ./src/events.js
	// @include ./src/utils.js

	let Setup = {
		fire: (func, funcname, args) => {
			let fire, namespace = Events;
			funcname = funcname || 'init';
			fire = (func !== '' && namespace[func] && typeof namespace[func][funcname] === 'function');

			if (fire)
				namespace[func][funcname](args);
		},
		loadEvents: () => {
			Setup.fire('common');
			PAGE_PARAMS = d.body.className.replace(/-/g, '_').split(/\s+/);
			for (let i = 0; i < PAGE_PARAMS.length; i++) {
				Setup.fire(PAGE_PARAMS[i]);
				Setup.fire(PAGE_PARAMS[i], 'end');
			}
			Setup.fire('common', 'end');
		}
	};

	if (d.readyState === "interactive" || d.readyState === "complete")
		Setup.loadEvents();
	else
		d.addEventListener("DOMContentLoaded", function loadListener() {
			d.removeEventListener("DOMContentLoaded", loadListener, false);
			Setup.loadEvents();
		}, false);
})(window.jQuery || window.Zepto || window.Cash || undefined);

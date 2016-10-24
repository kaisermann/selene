'use strict';

import Router from './Util/router';
import common from './Events/common';

(function ($, undefined) {
  // Modify the '_events' object to include or remove other routes
  const _events = {
    common
  };

  // Normally, you won't need to modify anything below this line.
  // Useful short aliases
  const
    _win = window,
    _doc = document,
    _body = document.body,
    _router = new Router(_events).loadClasses();

  if(document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    _router.loadEvents();
  } else {
    _doc.addEventListener('DOMContentLoaded', () => _router.loadEvents(), false);
  }
})(window.jQuery || window.Zepto || window.Cash);

/* eslint no-unused-vars: "off" */

import Router from './Util/router';
import common from './Events/common';

(function ($) {
  // Modify the '_events' object to include or remove other routes
  const _events = {
    common,
  };

  // Usually, you won't need to modify anything below this line.
  // Useful short aliases
  const _win = window;
  const _doc = _win.document;
  const _body = _doc.body;
  const _router = new Router(_events).loadClasses();

  if (_doc.readyState === 'complete' ||
    (_doc.readyState !== 'loading' && !_doc.documentElement.doScroll)) {
    _router.loadEvents();
  } else {
    _doc.addEventListener('DOMContentLoaded', () => _router.loadEvents(), false);
  }
}(window.jQuery || window.Zepto || window.Cash));

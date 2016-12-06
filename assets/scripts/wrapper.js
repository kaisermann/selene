/* jshint unused: false */

import Router from './utils/router.js';
import common from './events/common.js';

($ => {
  // Modify the 'events' object to include or remove other routes
  const events = {
    common,
  };

  // Usually, you won't need to modify anything below this line.
  const router = new Router(events).loadClasses();

  if (document.readyState === 'complete' ||
    (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
    router.loadEvents();
  } else {
    document.addEventListener('DOMContentLoaded', () => router.loadEvents(), false);
  }
})(window.jQuery || window.Zepto || window.Cash);

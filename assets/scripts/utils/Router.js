/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 * ======================================================================== */

import camelCase from './camelCase';

// The routing fires all common scripts, followed by the page specific scripts.
// Add additional events for more control over timing e.g. a finalize event
export default class Router {
  constructor(events) {
    this.events = events;
    this.classes = [];
  }

  fire(route, fn = 'init', args = undefined) {
    if (route !== '' && this.events[route] && typeof this.events[route][fn] === 'function') {
      this.events[route][fn](args);
    }
    return this;
  }

  loadEvents() {
    // Fire common init JS
    this.fire('common');

    this.classes = document.body.className
      .toLowerCase()
      .replace(/-/g, '_')
      .split(/\s+/)
      .map(camelCase);

    // Fire page-specific init JS, and then finalize JS
    this.classes.forEach((className) => {
      this.fire(className);
      this.fire(className, 'finalize');
    });

    // Fire common finalize JS
    this.fire('common', 'finalize');
    return this;
  }
}

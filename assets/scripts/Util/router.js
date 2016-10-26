import camelCase from './camelCase';

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

  loadClasses() {
    this.classes = document.body.className
      .toLowerCase()
      .replace(/-/g, '_')
      .split(/\s+/)
      .map(camelCase);
    return this;
  }

  loadEvents() {
    this.fire('common');

    this.classes
      .forEach((className) => {
        this.fire(className);
        this.fire(className, 'finalize');
      });

    this.fire('common', 'finalize');
    return this;
  }
}

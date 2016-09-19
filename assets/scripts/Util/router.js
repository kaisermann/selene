import camelCase from './camelCase';

export default class Router {
	constructor(routes) {
		this.routes = routes;
		this.classes = [];
	}

	fire(route, fn = 'init', args) {
		if (route !== '' && this.routes[route] && typeof this.routes[route][fn] === 'function')
			this.routes[route][fn](args);
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

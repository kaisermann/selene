import camelCase from './camelCase';

export default class Router {
	constructor(routes) {
		this.routes = routes;
	}

	fire(route, fn = 'init', args) {
		const fire = route !== '' && this.routes[route] && typeof this.routes[route][fn] === 'function';
		if (fire)
			this.routes[route][fn](args);
	}

	loadEvents() {
		this.fire('common');

		document.body.className
			.toLowerCase()
			.replace(/-/g, '_')
			.split(/\s+/)
			.map(camelCase)
			.forEach((className) => {
				this.fire(className);
				this.fire(className, 'finalize');
			});

		this.fire('common', 'finalize');
	}
}

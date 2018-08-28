import { createServer as cs, plugins } from 'restify';

export const createServer = () => {
	const server = cs({
		name: 'myapp',
		version: '1.0.0'
	});

	server.use(plugins.acceptParser(server.acceptable));
	server.use(plugins.queryParser());
	server.use(plugins.bodyParser());

	server.listen(3000, function () {
		console.log('%s listening at %s', server.name, server.url);
	});

	return server;
};

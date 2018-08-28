import { Task } from '@ts-task/task';
import { objOf, str, oneOf, anything } from 'ts-dynamic-type-checker';
import { createServer } from './server-utils/create-server';
import { createEndpoint } from './server-utils/create-endpoint';
import { checkBody } from './middlewares/check-body.middleware';

// TODO: read server data from package.json
// TODO: tslint
// TODO: tests
// TODO: jsdocs
// TODO: read configs and secrets from files
// TODO: improve logging (winston?)

const server = createServer();

server.get('/echo/:name', function (req, res, next) {
	res.send(req.params);
	return next();
});

server.get('/ping', createEndpoint(_ =>
	Task
		.resolve({
			connection: true
		})
	)
);

server.post('/api/product/search', createEndpoint(req =>
	Task
		.resolve(req)
		.chain(checkBody(objOf({
			query: str,
			provider: oneOf('easy'),
			// TODO: improve options typings
			options: anything,
			callbackUrl: str
		})))
		.map(_ => ({
			connection: true
		}))
		.map(x => {
			console.log(req.body)
			return x;
		})
	)
);

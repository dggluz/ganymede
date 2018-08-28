import { createServer, Request, Response, plugins } from 'restify';
import { Task, UncaughtError } from '@ts-task/task';
import { objOf, str } from 'ts-dynamic-type-checker';
import { isInstanceOf, caseError } from '@ts-task/utils';

// TODO: read server data from package.json
// TODO: tslint
// TODO: tests
// TODO: jsdocs
// TODO: read configs and secrets from files
// TODO: improve logging (winston?)

const server = createServer({
	name: 'myapp',
	version: '1.0.0'
});

server.use(plugins.acceptParser(server.acceptable));
server.use(plugins.queryParser());
server.use(plugins.bodyParser());

server.get('/echo/:name', function (req, res, next) {
	res.send(req.params);
	return next();
});

const tap = <T> (fn: (x: T) => any) =>
	(x: T) => {
		fn(x);
		return x;
	}
;

const noop = () => undefined;

const logUnhandledError = (err: Error) => {
	console.error('Unhandled error!', err);
};

const createEndpoint = (controller: (req: Request) => Task<object, HttpError | UncaughtError>) =>
	(req: Request, res: Response) =>
		controller(req)
			.map(tap(result => res.send(200, result)))
			.catch(
				caseError(
					isInstanceOf(UncaughtError),
					err => {
						logUnhandledError(err);
						return Task.reject(new InternalServerError());
					})
			)
			.catch(
				caseError(
					isInstanceOf(HttpError),
					err => {
						res.send(err.errorCode, {
							error: err.errorMessage
						});
						return Task.resolve(void 0);
					})
			)
			.fork(logUnhandledError, noop)
;

server.get('/ping', createEndpoint(_ =>
	Task
		.resolve({
			connection: true
		})
	)
);

class HttpError extends Error {
	HttpError = 'HttpError';

	errorCode: number = 0;
	errorMessage: string = '';
}

class BadRequestError extends HttpError {
	BadRequestError = 'BadRequestError';

	errorCode = 400;
	errorMessage = 'Bad request';

	constructor (public originalError: Error) {
		super(originalError.message);
		this.errorMessage = `Bad request: ${originalError.message}`;
	}
}

class InternalServerError extends HttpError {
	errorCode = 500;
	errorMessage = 'Internal server error';
}

const taskContract = <T> (contract: (x: T) => T) =>
	(x: T): Task<T, BadRequestError | UncaughtError> => {
		try {
			return Task.resolve(contract(x));
		}
		catch(err) {
			return Task
				.reject(isInstanceOf(TypeError)(err) ?
					new BadRequestError(err) :
					new UncaughtError(err)
				)
		}
};

const checkBody = <T, R> (contract: (x: T) => T) =>
	(req: R) =>
		taskContract(contract)((req as any).body)
			.map(_ => req as any as R & {body: T})
;

server.post('/api/product/search', createEndpoint(req =>
	Task
		.resolve(req)
		.chain(checkBody(objOf({
			foo: str
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

server.listen(3000, function () {
	console.log('%s listening at %s', server.name, server.url);
});

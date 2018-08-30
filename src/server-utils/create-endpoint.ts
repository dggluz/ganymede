import { Task, UncaughtError } from '@ts-task/task';
import { HttpError, InternalServerError } from '../http-errors';
import { Request, Response } from 'restify';
import { tap, logUnhandledError, noop } from '../utils';
import { caseError, isInstanceOf } from '@ts-task/utils';

/**
 * Takes a controller function and sends its result to the client, managing errors.
 * @param controller function with the endpoint functionality, takes only a Request parameter
 * 					and should return a Task resolved with the response or rejected with an
 * 					HttpError or an UncaughtError
 * @return function to set as an endpoint to the restify server (whith methods .get, .post, etc.).
 */
export const createEndpoint = <T> (controller: (req: Request) => Task<T, HttpError | UncaughtError>) =>
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

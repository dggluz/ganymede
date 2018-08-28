import { Task, UncaughtError } from '@ts-task/task';
import { HttpError, InternalServerError } from '../http-errors';
import { Request, Response } from 'restify';
import { tap, logUnhandledError, noop } from '../utils';
import { caseError, isInstanceOf } from '@ts-task/utils';

export const createEndpoint = (controller: (req: Request) => Task<object, HttpError | UncaughtError>) =>
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

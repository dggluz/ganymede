import { Overwrite } from 'type-zoo';
import { Task, UncaughtError } from '@ts-task/task';
import { isInstanceOf } from '@ts-task/utils';

export const tap = <T> (fn: (x: T) => any) =>
	(x: T) => {
		fn(x);
		return x;
	}
;

/**
 * Does nothing
 * @return undefined
 */
export const noop = () => undefined;

/**
 * Logs an error to the console
 * @param err 
 * @return undefined
 */
export const logUnhandledError = (err: Error) => {
	console.error('Unhandled error!', err);
};


export const overwrite = <A, B> (target: A, source: B) =>
	Object.assign(
		Object.create(target.constructor.prototype),
		target,
		source
	) as any as Overwrite<A, B>
;

export const taskValidation = <A, B, E> (validation: (x: A) => B, errHandler: (err: TypeError) => E) =>
	(x: A): Task<B, E | UncaughtError> => {
		try {
			return Task.resolve(validation(x));
		}
		catch(err) {
			return Task
				.reject(isInstanceOf(TypeError)(err) ?
					errHandler(err) :
					new UncaughtError(err)
				)
		}
};

export const asUncaughtError = (err: any) => Task.reject(new UncaughtError(err));
 
import { Overwrite } from 'type-zoo';
import { Task, UncaughtError } from '@ts-task/task';
import { isInstanceOf } from '@ts-task/utils';

/**
 * Calls `fn` performing its side effects but discarding its return value and returning the input parameter instead.
 * @param fn Unary function that performs side effects and whose return value will be discarded
 * @returns "tapped" `fn`
 */
export const tap = <T> (fn: (x: T) => any) =>
	(x: T) => {
		fn(x);
		return x;
	}
;

/**
 * Takes a function that returns a Task and calls it but mapping the resolved value to the input value.
 * @param fn Unary function that performs side effects and returns a Task.
 * @returns Task resolved with the input value or rejected with the rejected values from the output Task.
 */
export const tapChain = <A, E> (fn: (x: A) => Task<any, E>) =>
	(x: A) =>
		fn(x)
			.map(_ => x)
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

/**
 * Overwrite takes two objects and returns a new one, that is like the first one,
 * overwritten with the second one. Mantains prototype chain of the firs object (in the result).
 * @param target original object
 * @param source object with the properties to overwrite
 * @returns "merged" object
 */
export const overwrite = <A, B> (target: A, source: B) =>
	Object.assign(
		Object.create(target.constructor.prototype),
		target,
		source
	) as any as Overwrite<A, B>
;

/**
 * Takes a function that returns a sync result or throws an error and calls it from a
 * Task, handling the error if it is a TypeError, with the errHandler function
 * @param validation function that takes a parameter and returns a sync value or throws TypeError
 * @param errHandler function that takes a TypeError and returns another Error
 * @returns Task to the validation result, possible rejected with the results of the errHandler
 */
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

/**
 * Takes and error and wraps it in an UncaughtError
 * @param err Error (<E>)
 * @returns UncaughtError<E> wrapping err
 */
export const asUncaughtError = (err: any) => Task.reject(new UncaughtError(err));

/**
 * Decodes a base64 encoded string
 * @param base64EncodedString 
 * @returns decoded string
 */
export const base64Decode = (base64EncodedString: string) =>
	Buffer
		.from(base64EncodedString, 'base64')
		.toString()
;

/**
 * Takes a predicate and an error. Returns a function to a Task that is resolved with the input value
 * if the predicate evaluates to `true` or is rejected with the error otherwise. 
 * @param condition sync predicate
 * @param error error to throw if the condition returns `false`
 * @returns Task rejected with the error or resolved with the value.
 */
export const rejectIf = <T, E> (condition: (x: T) => boolean, error: E) =>
	(x: T): Task<T, E> =>
		condition(x) ?
			Task.reject(error) :
			Task.resolve(x)
;

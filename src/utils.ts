import { Overwrite } from 'type-zoo';

export const tap = <T> (fn: (x: T) => any) =>
	(x: T) => {
		fn(x);
		return x;
	}
;

export const noop = () => undefined;

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

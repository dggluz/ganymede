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

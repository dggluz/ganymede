// Note: as TypeScript has structural type inference, we need to make objects' structures "unique" between
// different classes to let TypeScript infer them as different types. Hence, I added a public property with
// the name of the Error to each of the Error classes

/**
 * Basic HttpError
 * @constructor
 * @extends Error
 */
export class HttpError extends Error {
	HttpError = 'HttpError';

	errorCode = 500;
	errorMessage = 'Internal server error';
}

/**
 * BadRequestError (status code 400)
 * @constructor
 * @extends HttpError
 */
export class BadRequestError extends HttpError {
	BadRequestError = 'BadRequestError';

	errorCode = 400;
	errorMessage = 'Bad request';

	/**
	 * Wraps the original error
	 * @param originalError 
	 */
	constructor (public originalError: Error) {
		super(originalError.message);
		this.errorMessage = `Bad request: ${originalError.message}`;
	}
}

/**
 * NotFoundError (status code 404)
 * @constructor
 * @extends HttpError
 */
export class NotFoundError extends HttpError {
	NotFoundError = 'NotFoundError';

	errorCode = 404;
	errorMessage = 'Entity not found';

	/**
	 * Takes a mandatory error message
	 * @param message 
	 */
	constructor (message: string) {
		super(message);
		this.errorMessage = message;
	}
}

/**
 * InternalServerError (statusCode 500)
 * @constructor
 * @extends HttpError
 */
export class InternalServerError extends HttpError {
	InternalServerError = 'InternalServerError';
}

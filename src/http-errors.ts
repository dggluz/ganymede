export class HttpError extends Error {
	HttpError = 'HttpError';

	errorCode = 500;
	errorMessage = 'Internal server error';
}

export class BadRequestError extends HttpError {
	BadRequestError = 'BadRequestError';

	errorCode = 400;
	errorMessage = 'Bad request';

	constructor (public originalError: Error) {
		super(originalError.message);
		this.errorMessage = `Bad request: ${originalError.message}`;
	}
}

export class NotFoundError extends HttpError {
	NotFoundError = 'NotFoundError';

	errorCode = 404;
	errorMessage = 'Entity not found';

	constructor (message: string) {
		super(message);
		this.errorMessage = message;
	}
}

export class InternalServerError extends HttpError {
	InternalServerError = 'InternalServerError';
}

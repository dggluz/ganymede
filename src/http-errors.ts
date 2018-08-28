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

export class InternalServerError extends HttpError {
	InternalServerError = 'InternalServerError';
}

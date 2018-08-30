import * as request from 'request';
import { Task } from '@ts-task/task';
import { isInstanceOf } from '@ts-task/utils';

export class RequestError extends Error {
	RequestError = 'RequestError';
}

export class RequestNotSuccessfulError extends Error {
	RequestNotSuccessfulError = 'RequestNotSuccessfulError';

	constructor (public response: request.Response) {
		super(response.body);
	}
}

// TODO: fix options typings
export const makeRequest = <T> (url: string, options: request.CoreOptions = {}) =>
	new Task<T, RequestNotSuccessfulError | RequestError>((resolve, reject) => {
		request(url, options, (err, result) => {
			if (err) {
				reject(new RequestError(err));
			}
			else {
				if (result.statusCode === 200) {
					resolve(result.body as T);
				}
				else {
					reject(new RequestNotSuccessfulError(result));
				}
			}
		});
	})
;

export const postRequest = <F, T = any> (url: string, data: F, options: request.CoreOptions = {}) =>
	makeRequest<T>(url, {
		...options,
		method: 'POST',
		json: true,
		body: data
	})
;

export const getRequest = <T = any> (url: string, options: request.CoreOptions = {}) =>
	makeRequest<T>(url, {
		...options,
		method: 'GET'
	})
;

export const isRequestErorr = isInstanceOf(RequestError, RequestNotSuccessfulError);

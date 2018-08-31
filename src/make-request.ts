// Note: as TypeScript has structural type inference, we need to make objects' structures "unique" between
// different classes to let TypeScript infer them as different types. Hence, I added a public property with
// the name of the Error to each of the Error classes

import * as request from 'request';
import { Task } from '@ts-task/task';
import { isInstanceOf } from '@ts-task/utils';

/**
 * Error that represents an error performing a Request
 */
export class RequestError extends Error {
	RequestError = 'RequestError';
}

/**
 * Error that represents a request that returned but with an status code different than 200.
 * Wraps the response.
 */
export class RequestNotSuccessfulError extends Error {
	RequestNotSuccessfulError = 'RequestNotSuccessfulError';

	/**
	 * Wraps the request's response
	 * @param response 
	 */
	constructor (public response: request.Response) {
		super(response.body);
	}
}

/**
 * Makes a request and returns its response as a Task
 * @param url where to make the request
 * @param options request's options
 * @returns Task resolved with the response or rejected with RequestError or with 
 * 			RequestNotSucessfulError (if the response's statusCode is not 200)
 */
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

/**
 * Makes a POST request, sending the supplied data as JSON
 * @param url where to make the request
 * @param data form data to send (should be JSON-serializable)
 * @param options extra request's options
 * @returns Task to the request's response
 */
export const postRequest = <F, T = any> (url: string, data: F, options: request.CoreOptions = {}) =>
	makeRequest<T>(url, {
		...options,
		method: 'POST',
		json: true,
		body: data
	})
;

/**
 * Makes a GET request.
 * @param url where to make the request
 * @param options extra request's options
 * @returns Task to the request's response
 */
export const getRequest = <T = any> (url: string, options: request.CoreOptions = {}) =>
	makeRequest<T>(url, {
		...options,
		method: 'GET'
	})
;

/**
 * Helper function that tells if an error is a RequestError or RequestNotSuccessfulError
 * @param err error to test
 * @returns boolean (is RequestError | RequestNotSuccessfulError)
 */
export const isRequestError = isInstanceOf(RequestError, RequestNotSuccessfulError);

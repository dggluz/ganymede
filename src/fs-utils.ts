// Note: as TypeScript has structural type inference, we need to make objects' structures "unique" between
// different classes to let TypeScript infer them as different types. Hence, I added a public property with
// the name of the Error to each of the Error classes

import { readFile as rf } from 'fs';
import { Task } from '@ts-task/task';
import { IContract } from 'ts-dynamic-type-checker';
import { share, isInstanceOf } from '@ts-task/utils';
import { taskValidation } from './utils';

/**
 * Represents an error when accessing the OS file system
 * @constructor
 * @extends Error
 */
export class FsError extends Error {
	FsError = 'FsError';

	/**
	 * Wraps the original error
	 * @param originalError 
	 */
	constructor (public originalError: Error) {
		super(originalError.message);
	}
}

export class SyntaxJSONError extends Error {
	JSONError = 'JSONError';

	constructor (public originalError: Error) {
		super(originalError.message);
	}
}

/**
 * Represents an error parsing JSON.
 * @constructor
 * @extends Error
 */
export class InvalidJSONError extends Error {
	InvalidJSONError = 'InvalidJSONError';

	/**
	 * Wraps the original error
	 * @param originalError 
	 */
	constructor (public originalError: Error) {
		super(originalError.message);
	}
}

/**
 * Reads a file and returns is contents (as) text wrapped in Task
 * @param path File's path
 * @returns Task<string, FsError> a task to the file content (as string)
 */
export const readFile = (path: string) =>
	new Task<string, FsError>((resolve, reject) => {
		rf(path, 'utf8', (err, content) => {
			if (err) {
				reject(new FsError(err));
			}
			else {
				resolve(content);
			}
		});
	})
;

/**
 * Reads a file content and parses it as JSON
 * @param path File's path
 * @returns Task to the parsed file's content
 */
export const readJSONFile = (path: string) =>
	readFile(path)
		.chain(content => {
			try {
				return Task.resolve(JSON.parse(content));
			}
			catch (err) {
				return Task.reject(new SyntaxJSONError(err));
			}
		})
;

/**
 * Takes a file's path and a contract and reads the file, parses it as JSON and validate the result
 * against the contract, typing it.
 * @param path File's path
 * @param contract Contract<T> (see ts-dynamic-type-checker) to validate parsed file content typings
 * @returns a Task to the validated and typed parsed content of the file
 */
export const readAndValidateJSONFile = <T> (path: string, contract: IContract<T>) =>
	readJSONFile(path)
		.chain(taskValidation(contract, err => new InvalidJSONError(err)))
		// share function is used to "execute" the Task to that point and chache its
		// resolution or rejection value. That is because as Tasks are lazy, they would
		// be executed to that point each time they are forked (like calling its instance methods)
		.pipe(share())
;

/**
 * Helper function to determinate if an object is instance of any of the errors that
 * could be rejected when calling `readAndValidateJSONFile` function.
 * @param error error to check
 * @return boolean (typed as `is FsError | SyntaxJSONError | InvalidJSONError`)
 */
export const isJSONFileError = isInstanceOf(FsError, SyntaxJSONError, InvalidJSONError);

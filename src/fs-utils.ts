import { readFile as rf } from 'fs';
import { Task } from '@ts-task/task';
import { IContract } from 'ts-dynamic-type-checker';
import { share, isInstanceOf } from '@ts-task/utils';
import { taskContract } from './utils';

export class FsError extends Error {
	FsError = 'FsError';

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

export class InvalidJSONError extends Error {
	InvalidJSONError = 'InvalidJSONError';

	constructor (public originalError: Error) {
		super(originalError.message);
	}
}

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

export const readAndValidateJSONFile = <T> (path: string, contract: IContract<T>) =>
	readJSONFile(path)
		.chain(taskContract(contract, err => new InvalidJSONError(err)))
		.pipe(share())
;

export const isJSONFileError = isInstanceOf(FsError, SyntaxJSONError, InvalidJSONError);

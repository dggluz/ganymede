import { Task, UncaughtError } from '@ts-task/task';
import { BadRequestError } from '../http-errors';
import { isInstanceOf } from '@ts-task/utils';

export const taskContract = <T> (contract: (x: T) => T) =>
	(x: T): Task<T, BadRequestError | UncaughtError> => {
		try {
			return Task.resolve(contract(x));
		}
		catch(err) {
			return Task
				.reject(isInstanceOf(TypeError)(err) ?
					new BadRequestError(err) :
					new UncaughtError(err)
				)
		}
};


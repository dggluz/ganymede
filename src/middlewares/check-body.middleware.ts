import { overwrite, taskValidation } from '../utils';
import { BadRequestError } from '../http-errors';

export const checkBody = <A, B, R extends { body?: any }> (validation: (x: A) => B) =>
	(req: R) =>
		taskValidation(validation, err => new BadRequestError(err))(req.body)
			.map(body => overwrite(req, {body}))
;

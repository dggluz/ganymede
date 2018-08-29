import { overwrite, taskValidation } from '../utils';
import { BadRequestError } from '../http-errors';

export const checkParams = <A, B, R extends { params?: any }> (validation: (x: A) => B) =>
	(req: R) =>
		taskValidation(validation, err => new BadRequestError(err))(req.params)
			.map(params => overwrite(req, {params}))
;

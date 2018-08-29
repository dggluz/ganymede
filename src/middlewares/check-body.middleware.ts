import { overwrite, taskContract } from '../utils';
import { BadRequestError } from '../http-errors';

export const checkBody = <T, R extends { body?: any }> (contract: (x: T) => T) =>
	(req: R) =>
		taskContract(contract, err => new BadRequestError(err))(req.body)
			.map(body => overwrite(req, {body}))
;

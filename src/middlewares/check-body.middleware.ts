import { taskContract } from '../server-utils/task-contract';
import { overwrite } from '../utils';

export const checkBody = <T, R extends { body?: any }> (contract: (x: T) => T) =>
	(req: R) =>
		taskContract(contract)(req.body)
			.map(body => overwrite(req, {body}))
;

import { taskContract } from '../server-utils/task-contract';

export const checkBody = <T, R> (contract: (x: T) => T) =>
	(req: R) =>
		taskContract(contract)((req as any).body)
			.map(_ => req as any as R & {body: T})
;

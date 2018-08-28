import { Task } from '@ts-task/task';
import { createEndpoint } from '../server-utils/create-endpoint';

export const pingCtrl = createEndpoint(_ =>
	Task
		.resolve({
			connection: true
		})
	)
;

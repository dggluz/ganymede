import { Task } from '@ts-task/task';
import { createEndpoint } from '../server-utils/create-endpoint';

/**
 * Endpoint that just response with a dummy object. Useful to check if the server is alive.
 */
export const pingCtrl = createEndpoint(_ =>
	Task
		.resolve({
			connection: true
		})
	)
;

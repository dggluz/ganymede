import { Task } from '@ts-task/task';
import { objOf, str, oneOf, anything } from 'ts-dynamic-type-checker';
import { createEndpoint } from '../server-utils/create-endpoint';
import { checkBody } from '../middlewares/check-body.middleware';

export const newSearchCtrl = createEndpoint(req =>
	Task
		.resolve(req)
		.chain(checkBody(objOf({
			query: str,
			provider: oneOf('easy'),
			// TODO: improve options typings
			options: anything,
			callbackUrl: str
		})))
		.map(_ => ({
			connection: true
		}))
		.map(x => {
			console.log(req.body)
			return x;
		})
	)
;
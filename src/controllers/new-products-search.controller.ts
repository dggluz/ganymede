import { Task } from '@ts-task/task';
import { objOf, str, oneOf, anything } from 'ts-dynamic-type-checker';
import { createEndpoint } from '../server-utils/create-endpoint';
import { checkBody } from '../middlewares/check-body.middleware';

import { MongoError } from 'mongodb';
import { caseError, isInstanceOf } from '@ts-task/utils';
import { asUncaughtError } from '@ts-task/task/dist/lib/src/operators';
import { insertOneDocument } from '../mongo-utils';

export const newProductsSearchCtrl = createEndpoint(req =>
	Task
		.resolve(req)
		.chain(checkBody(objOf({
			query: str,
			provider: oneOf('easy'),
			// TODO: improve options typings (relate with the provider)
			options: anything,
			callbackUrl: str
		})))
		.map(req => req)
		// TODO: add extra fields to document (searchData, status, products)
		.chain(req => insertOneDocument('search-order', req.body))
		.map(x => x)
		.catch(caseError(isInstanceOf(MongoError), asUncaughtError))
	)
;

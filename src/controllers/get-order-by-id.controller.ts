import { createEndpoint } from '../server-utils/create-endpoint';
import { Task } from '@ts-task/task';
import { findOneDocument, isMongoError } from '../mongo-utils';
import { SearchOrder } from './new-products-search.controller';
import { ObjectId } from 'mongodb';
import { asUncaughtError } from '@ts-task/task/dist/lib/src/operators';
import { caseError } from '@ts-task/utils';
import { isJSONFileError } from '../fs-utils';
import { checkParams } from '../middlewares/check-params.middleware';
import { objectOfLike, mongoIdLike } from '../type-like';

const findSearhOrder = findOneDocument<SearchOrder>('search-order');
const getSearchOrderById = (orderId: ObjectId) => findSearhOrder({
	_id: orderId
});

export const getOrderByIdCtrl = createEndpoint(req =>
	Task
		.resolve(req)
		.chain(checkParams(objectOfLike({
			orderId: mongoIdLike
		})))
		.chain(req => getSearchOrderById(req.params.orderId))
		.catch(caseError(isMongoError, err => asUncaughtError(err)))
		.catch(caseError(isJSONFileError, err => asUncaughtError(err)))
);

import { createEndpoint } from '../server-utils/create-endpoint';
import { Task } from '@ts-task/task';
import { findOneDocument, isMongoError, MongoDocumentDoesNotExistError } from '../mongo-utils';
import { SearchOrder } from './new-products-search.controller';
import { ObjectId } from 'mongodb';
import { caseError, isInstanceOf } from '@ts-task/utils';
import { isJSONFileError } from '../fs-utils';
import { checkParams } from '../middlewares/check-params.middleware';
import { objectOfLike, mongoIdLike } from '../type-like';
import { asUncaughtError } from '../utils';
import { NotFoundError } from '../http-errors';

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
		.catch(caseError(
			isInstanceOf(MongoDocumentDoesNotExistError),
			err => Task.reject(new NotFoundError(`Search order with id ${(err.criteria as SearchOrder)._id} does not exist`))
		))
		.catch(caseError(isMongoError, err => asUncaughtError(err)))
		.catch(caseError(isJSONFileError, err => asUncaughtError(err)))
);

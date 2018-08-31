import { createEndpoint } from '../server-utils/create-endpoint';
import { Task } from '@ts-task/task';
import { basicAuthMiddleware } from '../middlewares/basic-auth.middleware';
import { authorizationMiddleware } from '../middlewares/authorization.middleware';
import { caseError } from '@ts-task/utils';
import { isJSONFileError } from '../fs-utils';
import { asUncaughtError } from '../utils';
import { checkBody } from '../middlewares/check-body.middleware';
import { strictObjOf, str, oneOf, arrOf, num, optional } from 'ts-dynamic-type-checker';
import { updateSearchOrder } from './new-products-search.controller';
import { MongoDocumentId, isMongoError } from '../mongo-utils';
import { objectOfLike, mongoIdLike } from '../type-like';

export interface ProductInformation {
	sku: string;
	name: string;
	price: number;
	originalPrice: number;
	category: string;
	description: string;
	images: string[];
}

export interface SearchResults {
	searchOrderId: MongoDocumentId;
	query: string;
	status: 'fulfilled' | 'failed';
	products?: ProductInformation[];
}

const productsInformationContract = strictObjOf<ProductInformation>({
	sku: str,
	name: str,
	price: num,
	originalPrice: num,
	category: str,
	description: str,
	images: arrOf(str)
});


const searchResultContract = objectOfLike<SearchResults>({
	searchOrderId: mongoIdLike,
	query: str,
	status: oneOf('fulfilled', 'failed'),
	products: optional(arrOf(productsInformationContract))
});

export const saveSearchResultsCtrl = createEndpoint(req => 
	Task
		.resolve(req)
		.chain(basicAuthMiddleware)
		.chain(authorizationMiddleware('save-search-results'))
		.chain(checkBody(searchResultContract))
		// TODO: functionality
		.chain(req => updateSearchOrder({
			_id: req.body.searchOrderId
		}, {
			$set: {
				status: req.body.status,
				// TODO: upsert products, then relate here
				products: []
			}
		}))
		.catch(caseError(isJSONFileError, err => asUncaughtError(err)))
		.catch(caseError(isMongoError, err => asUncaughtError(err)))
		.pipe(t => t)
);
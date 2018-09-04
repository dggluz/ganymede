import { createEndpoint } from '../server-utils/create-endpoint';
import { Task } from '@ts-task/task';
import { basicAuthMiddleware } from '../middlewares/basic-auth.middleware';
import { authorizationMiddleware } from '../middlewares/authorization.middleware';
import { caseError, isInstanceOf } from '@ts-task/utils';
import { isJSONFileError } from '../fs-utils';
import { asUncaughtError } from '../utils';
import { checkBody } from '../middlewares/check-body.middleware';
import { strictObjOf, str, oneOf, arrOf, num, optional } from 'ts-dynamic-type-checker';
import { updateSearchOrder, Product, Provider } from './new-products-search.controller';
import { MongoDocumentId, isMongoError, findOneDocument, MongoDocumentDoesNotExistError, updateOneDocument, insertOneDocument } from '../mongo-utils';
import { objectOfLike, mongoIdLike } from '../type-like';
import { ObjectId } from 'mongodb';

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
	provider: Provider;
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
	products: optional(arrOf(productsInformationContract)),
	provider: oneOf('easy')
});

const findProduct = findOneDocument<Product>('products');

const updateProduct = updateOneDocument<Product>('products');

const insertProduct = insertOneDocument<Product>('products');

// TODO: make transactional
const upsertProduct = (relatedSearchOrderId: ObjectId, provider: Provider) =>
	(product: ProductInformation) =>
		findProduct({
			sku: product.sku,
			provider: provider
		})
		.chain(existingProduct =>
			updateProduct({
				_id: existingProduct._id
			}, {
				$addToSet: {
					relatedSearchQueries: {$each: [relatedSearchOrderId]}
				}
			})
				.map(_ => existingProduct._id)
		)
		.catch(caseError(
			isInstanceOf(MongoDocumentDoesNotExistError),
			_ =>
				insertProduct({
					...product,
					relatedSearchQueries: [relatedSearchOrderId],
					provider: provider
				})
					.map(product => product._id)
			)
		)
;

const fixTaskAllTypings = <T, E> (task: Task<[T], E>): Task<T[], E> =>
	task
;

const upsertProducts = (products: ProductInformation[], relatedSearchOrderId: ObjectId, provider: Provider) => {
	return fixTaskAllTypings(Task.all(products.map(upsertProduct(relatedSearchOrderId, provider))))
};

const addOrUpdateProducts = (searchResult: SearchResults) => {
	if (!searchResult.products) {
		return Task.resolve([] as ObjectId[]);
	}

	return upsertProducts(
		searchResult.products,
		searchResult.searchOrderId,
		searchResult.provider
	);
};

export const saveSearchResultsCtrl = createEndpoint(req => 
	Task
		.resolve(req)
		.chain(basicAuthMiddleware)
		.chain(authorizationMiddleware('save-search-results'))
		.chain(checkBody(searchResultContract))
		.map(req => req.body)
		.chain(searchResult =>
			addOrUpdateProducts(searchResult)
					.chain(productIds =>
					updateSearchOrder({
						_id: searchResult.searchOrderId
					}, {
						$set: {
							status: searchResult.status,
							products: productIds
						}
					})
				)
		)
		.catch(caseError(isJSONFileError, err => asUncaughtError(err)))
		.catch(caseError(isMongoError, err => asUncaughtError(err)))
		.map(_ => ({
			status: 'ok'
		}))
);
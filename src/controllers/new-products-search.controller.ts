import { Task } from '@ts-task/task';
import { objOf, str, oneOf, anything } from 'ts-dynamic-type-checker';
import { createEndpoint } from '../server-utils/create-endpoint';
import { checkBody } from '../middlewares/check-body.middleware';
import { caseError } from '@ts-task/utils';
import { insertOneDocument, MongoDocument, isMongoError, updateOneDocument, MongoDocumentId } from '../mongo-utils';
import { isJSONFileError } from '../fs-utils';
import { asUncaughtError, tapChain } from '../utils';
import { isRequestError, postRequest } from '../make-request';
import { secrets } from '../secrets';
import { configs } from '../configs';

export type Provider = 'easy';

// TODO: complete
export interface Product extends MongoDocument {
	sku: string;
	name: string;
	price: number;
	originalPrice: number;
	category: string;
	description: string;
	images: string[];
	relatedSearchQueries: MongoDocumentId[];
	provider: Provider;
}

export interface SearchOrder extends MongoDocument {
	searchData: SearchData;
	status: 'received' | 'processing' | 'fulfilled' | 'failed';
	products: MongoDocumentId[];
}

export interface SearchData {
	query: string;
	provider: Provider;
	options: any;
	callbackUrl: string;
}

export interface ThemistoSearchRequest {
	searchOrderId: string;
	query: string;
	provider: 'easy';
	options: any;
}

const insertSearchOrder = insertOneDocument<SearchOrder>('search-order');

export const updateSearchOrder = updateOneDocument<SearchOrder>('search-order');

export const newProductsSearchCtrl = createEndpoint(req =>
	Task
		.resolve(req)
		.chain(checkBody(objOf<SearchData>({
			query: str,
			provider: oneOf('easy'),
			// TODO: improve options typings (relate with the provider)
			options: anything,
			callbackUrl: str
		})))
		.chain(req => insertSearchOrder({
			searchData: req.body,
			status: 'received',
			products: []
		}))
		.chain(tapChain(searchOrder =>
			Task
				.all([secrets, configs])
				.chain(([secrets, configs]) =>
					postRequest<ThemistoSearchRequest>(
						configs.themisto.searchProduct.url, {
							searchOrderId: searchOrder._id.toHexString(),
							query: searchOrder.searchData.query,
							provider: searchOrder.searchData.provider,
							options: searchOrder.searchData.options
						}, {
							auth: secrets.auth.myself
						}
					)
					.chain(tapChain(_ =>
						updateSearchOrder({
							_id: searchOrder._id
						}, {
							$set: {
								status: 'processing'
							}
						})
					))
				)
		))
		.catch(caseError(isRequestError, err => asUncaughtError(err)))
		.catch(caseError(isMongoError, err => asUncaughtError(err)))
		.catch(caseError(isJSONFileError, err => asUncaughtError(err)))
	)
;

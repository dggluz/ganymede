import { createEndpoint } from '../server-utils/create-endpoint';
import { Task } from '@ts-task/task';
import { basicAuthMiddleware } from '../middlewares/basic-auth.middleware';
import { authorizationMiddleware } from '../middlewares/authorization.middleware';
import { caseError } from '@ts-task/utils';
import { isJSONFileError } from '../fs-utils';
import { asUncaughtError } from '../utils';
import { checkBody } from '../middlewares/check-body.middleware';
import { union, strictObjOf, str, oneOf, arrOf, num } from 'ts-dynamic-type-checker';

export interface ProductInformation {
	sku: string;
	name: string;
	price: number;
	originalPrice: number;
	category: string;
	description: string;
	images: string[];
}

export interface SearchSuccessfulResult {
	searchOrderId: string;
	query: string;
	status: 'fulfilled';
	products: ProductInformation[];
}

export interface SearchFailedResult {
	searchOrderId: string;
	query: string;
	status: 'failed';
}

export type SearchResults = SearchSuccessfulResult | SearchFailedResult;

const productsInformationContract = strictObjOf<ProductInformation>({
	sku: str,
	name: str,
	price: num,
	originalPrice: num,
	category: str,
	description: str,
	images: arrOf(str)
});

const searchSuccessfulResultContract = strictObjOf<SearchSuccessfulResult>({
	searchOrderId: str,
	query: str,
	status: oneOf('fulfilled'),
	products: arrOf(productsInformationContract)
});

const searchFailedResultContract = strictObjOf<SearchFailedResult>({
	searchOrderId: str,
	query: str,
	status: oneOf('failed')
});

const searchResultContract = union(
	searchSuccessfulResultContract,
	searchFailedResultContract
);

export const saveSearchResultsCtrl = createEndpoint(req => 
	Task
		.resolve(req)
		.chain(basicAuthMiddleware)
		.chain(authorizationMiddleware('save-search-results'))
		.chain(checkBody(searchResultContract))

		// TODO: functionality

		.catch(caseError(isJSONFileError, err => asUncaughtError(err)))
);
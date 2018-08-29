import { Task } from '@ts-task/task';
import { objOf, str, oneOf, anything } from 'ts-dynamic-type-checker';
import { createEndpoint } from '../server-utils/create-endpoint';
import { checkBody } from '../middlewares/check-body.middleware';
import { caseError, isInstanceOf } from '@ts-task/utils';
import { asUncaughtError } from '@ts-task/task/dist/lib/src/operators';
import { insertOneDocument, MongoDocument, MongoError, MongoInsertError } from '../mongo-utils';
import { isJSONFileError } from '../fs-utils';

// TODO: complete
interface Product extends MongoDocument {

}

interface SearchOrder extends MongoDocument {
	searchData: SearchData;
	status: 'received' | 'processing' | 'fulfilled' | 'failed';
	products: Product[];
}

interface SearchData {
	query: string;
	provider: 'easy';
	options: any;
	callbackUrl: string;
}

const insertSearchOrder = insertOneDocument<SearchOrder>('search-order');

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
		.map(req => req)
		.chain(req => insertSearchOrder({
			searchData: req.body,
			status: 'received',
			products: []
		}))
		.catch(caseError(isInstanceOf(MongoError, MongoInsertError), err => asUncaughtError(err)))
		.catch(caseError(isJSONFileError, err => asUncaughtError(err)))
	)
;

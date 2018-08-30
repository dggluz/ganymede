import { createServer } from './server-utils/create-server';
import { pingCtrl } from './controllers/ping.controller';
import { newProductsSearchCtrl } from './controllers/new-products-search.controller';
import { getOrderByIdCtrl } from './controllers/get-order-by-id.controller';

// TODO: tslint
// TODO: tests
// TODO: jsdocs
// TODO: improve logging (winston?)
// TODO: README

// TODO: call themisto
// TODO: call back to callbackUrl
// TODO: GET /api/product/search-orders
// TODO: GET /api/product/category/{product-category-id}

createServer()
	.fork(console.log, server => {
		server.get('/ping', pingCtrl);
		server.post('/api/product/search', newProductsSearchCtrl);
		server.get('/api/product/search-order/:orderId', getOrderByIdCtrl);
	})
;

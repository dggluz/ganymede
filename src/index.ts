import { createServer } from './server-utils/create-server';
import { pingCtrl } from './controllers/ping.controller';
import { newProductsSearchCtrl } from './controllers/new-products-search.controller';

// TODO: read server data from package.json
// TODO: tslint
// TODO: tests
// TODO: jsdocs
// TODO: improve logging (winston?)
// TODO: README

createServer()
	.fork(console.log, server => {
		server.get('/ping', pingCtrl);
		server.post('/api/product/search', newProductsSearchCtrl);
	})
;

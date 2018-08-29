import { createServer } from './server-utils/create-server';
import { pingCtrl } from './controllers/ping.controller';
import { newProductsSearchCtrl } from './controllers/new-products-search.controller';

// TODO: read server data from package.json
// TODO: read configs and secrets from files
// TODO: tslint
// TODO: tests
// TODO: jsdocs
// TODO: improve logging (winston?)
// TODO: README

const server = createServer();

server.get('/ping', pingCtrl);
server.post('/api/product/search', newProductsSearchCtrl);

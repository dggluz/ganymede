import { readAndValidateJSONFile } from './fs-utils';
import { resolve } from 'path';
import { strictObjOf, str, num } from 'ts-dynamic-type-checker';

const secretsContract = strictObjOf({
	// TODO: add auth
	mongo: strictObjOf({
		host: str,
		port: num,
		dbName: str
	})
});

export const secrets = readAndValidateJSONFile(resolve(process.cwd(), 'secrets.json'), secretsContract);

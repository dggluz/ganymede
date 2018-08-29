import { readAndValidateJSONFile } from './fs-utils';
import { resolve } from 'path';
import { strictObjOf, num } from 'ts-dynamic-type-checker';

const configsContract = strictObjOf({
	server: strictObjOf({
		port: num
	})
});

export const configs = readAndValidateJSONFile(resolve(process.cwd(), 'configs.json'), configsContract);

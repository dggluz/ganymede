import { readAndValidateJSONFile } from './fs-utils';
import { resolve } from 'path';
import { strictObjOf, str, num, arrOf } from 'ts-dynamic-type-checker';

/**
 * Contract (see ts-dynamic-type-checker) to validate that an object
 * has exactly one "user" property that is an string and one "password"
 * property that is also an string.
 * @param target object to validate
 * @returns validated target
 */
const userPassContract = strictObjOf({
	user: str,
	password: str
});

/**
 * Contract (see ts-dynamic-type-checker) to validate against the
 * expected form of the secrets.json file (throw TypeError if doesn't
 * validate and types the result if it does)
 * @param target object to validate
 * @returns validated target
 */
const secretsContract = strictObjOf({
	auth: strictObjOf({
		myself: userPassContract,
		otherUsers: arrOf(userPassContract)
	}),
	mongo: strictObjOf({
		host: str,
		port: num,
		dbName: str
	})
});

/**
 * Shared task to the content of the secrets.json file, parsed and validated.
 * If it was a production environment, the file should be an "external file" in docker swarm (or equivalent)
 */
export const secrets = readAndValidateJSONFile(resolve(process.cwd(), 'secrets.json'), secretsContract);

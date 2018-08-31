import { Request } from 'restify';
import { Task } from '@ts-task/task';
import { base64Decode, overwrite, rejectIf } from '../utils';
import { UnauthorizedError } from '../http-errors';
import { secrets } from '../secrets';

/**
 * Performs basic HTTP authentication. In a production environment I would
 * use bearer authentication instead of the basic one.
 * Checks the user and password against the ones defined in the configs.json file.
 * Again, in a production environment I would read them from another place (probably DB).
 * 
 * If the authentication fails, it rejects with an UnauthorizedError.
 * 
 * Note that this middleware actually performs authentication only (not authorization, see
 * the authorizationMiddleware for that).
 * @param req 
 * @returns req with the user info
 */
export const basicAuthMiddleware = <R extends Request> (req: R) =>
	Task
		.resolve(req)
		// Gets the "Authorization" header,
		.map(req => req.header('Authorization') || '')
		// ...checks that it is basic auth or reject with UnauthorizedError,
		.chain(rejectIf(authHeader => !/^Basic\s/.test(authHeader), new UnauthorizedError()))
		// ...gets the encoded part of the header
		.map(authHeader => authHeader.replace(/^Basic\s/, ''))
		// ...decodes it (basic HTTP encodes it as base64),
		.map(base64Decode)
		// ...split the "username:password" like string,
		.map(userPass => userPass.split(':'))
		// ...checks that there are two chunks, or rejects with UnauthorizedError,
		.chain(rejectIf(authInfo => authInfo.length !== 2, new UnauthorizedError()))
		// ...turns the array into an object with "user" and "password",
		.map(authInfo => ({
			user: authInfo[0],
			password: authInfo[1]
		}))
		// ...checks if the authInfo is present in the secrets.json auth info:
		.chain(authInfo =>
			secrets
				// tries to find the user and password in the "otherUsers" auth info
				.map(secrets =>
					secrets.auth.otherUsers.find(aUserInfo =>
						aUserInfo.user === authInfo.user && aUserInfo.password === authInfo.password
					)
				)
				// ...if it is not present, rejects with UnauthorizedError
				.chain(foundUser =>
					foundUser ?
						Task.resolve(foundUser) :
						Task.reject(new UnauthorizedError())
				)
		)
		// ...and finally returns the request, with the user info added
		.map(authInfo => overwrite(req, {
			user: authInfo.user
		}))
;

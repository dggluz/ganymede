import { configs } from '../configs';
import { Task } from '@ts-task/task';
import { InternalServerError, ForbiddenError } from '../http-errors';
import { rejectIf } from '../utils';

/**
 * This middleware checks if an user has an specific permissions. If it hasn't, rejects with a ForbiddenError.
 * To check user's permissions, searches in the configs.json data. In a production environment I would use
 * another more robust system, probably based on roles.
 * 
 * Note that this middleware does authorization only, not authentication (see basicAuthMiddleware for that).
 * In fact, the request should be already authenticated by this point.
 * @param permissionName
 * @returns Task resolved with original req, or rejected with ForbiddenError.
 */
export const authorizationMiddleware = (permissionName: string) =>
	<R extends {user: string}> (req: R) =>
		// Reads configs,
		configs
			// ...searches for the specific permission,
			.map(configs =>
				configs.permissions.find(aPermission =>
					aPermission.permissionName === permissionName
				)
			)
			// ...rejects with InternalServerError if it is not present (since it is a configuration problem),
			.chain(permission =>
				permission ?
					Task.resolve(permission) :
					Task.reject(new InternalServerError(`Permission ${permissionName} is not configured.`))
			)
			// ...checks if the user is among the authorized users,
			.map(permission =>
				permission.authorizedUsers.some(anAuthorizedUser =>
					anAuthorizedUser === req.user
				)
			)
			// ...if not, rejects with a ForbiddenError
			.chain(rejectIf(
				isAuthorized => !isAuthorized,
				new ForbiddenError(`User ${req.user} has no permissions to ${permissionName}`)
			))
			// ...and finally resolves the original request.
			.map(_ => req)
;
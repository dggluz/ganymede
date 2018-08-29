import { Task } from '@ts-task/task';
import { share } from '@ts-task/utils';
import { MongoClient, MongoError as _MongoError, Collection } from 'mongodb';
import { Omit } from 'type-zoo/types';
import { secrets } from './secrets';

export class MongoError extends Error {
	MongoError = 'MongoError';

	constructor (public originalError: _MongoError) {
		super(originalError.message);
	}
}

export const createMongoConnection = (url: string) =>
	new Task<MongoClient, MongoError>((resolve, reject) => {
		MongoClient.connect(
			url, {
				useNewUrlParser: true
			}, (err, client) => {
				if (err) {
					reject(new MongoError(err));
				}
				else {
					resolve(client);
				}
				// const db = client.db(dbName);
				
				// client.close();
			}
		);
	})
;

export type MongoDocumentId = string;

export interface MongoDocument {
	_id: MongoDocumentId;
}

export type UninsertedDocument <T> = Omit<T, '_id'>;

const mongoInsertOne = <T extends MongoDocument>  (document: UninsertedDocument<T>) =>
	(collection: Collection<T>) =>
		new Task<T, MongoError | MongoInsertError>((resolve, reject) => {
			collection
				.insertOne(document, (err, result) => {
					if (err) {
						reject(new MongoError(err));
					}
					else {
						if (result.insertedCount !== 1) {
							reject(new MongoInsertError())
						}
						else {
							resolve(result.ops[0]);
						}
					}
				})
		})
;

const dbCnx = secrets
	.chain(({mongo}) =>
		createMongoConnection(`mongodb://${mongo.host}:${mongo.port}`)
			.map(client => client.db(mongo.dbName))
	)
	.pipe(share())
;


export class MongoInsertError extends Error {
	MongoInsertError = 'MongoInsertError';
}

export const insertOneDocument = <T extends MongoDocument> (collectionName: string) =>
	(document: UninsertedDocument<T>) =>
		dbCnx
			.map(db => db.collection(collectionName))
			.chain(mongoInsertOne<T>(document))
;

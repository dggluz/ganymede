import { Task } from '@ts-task/task';
import { share, isInstanceOf } from '@ts-task/utils';
import { MongoClient, MongoError as _MongoError, Collection, FilterQuery, ObjectId } from 'mongodb';
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

export type MongoDocumentId = ObjectId;

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
						reject(new MongoInsertError(err));
					}
					else {
						if (result.insertedCount !== 1) {
							reject(new MongoInsertError(new Error('Could not insert the document')))
						}
						else {
							resolve(result.ops[0]);
						}
					}
				})
		})
;

const mongoFindOne = <T extends MongoDocument> (criteria: FilterQuery<T>) =>
	(collection: Collection<T>) =>
		new Task<T, MongoError | MongoDocumentDoesNotExistError<T>>((resolve, reject) => {
			collection.findOne(criteria, (err, result) => {
				if (err) {
					reject(new MongoError(err));
				}
				else {
					if (result === null) {
						reject(new MongoDocumentDoesNotExistError<T>(criteria));
					}
					else {
						resolve(result);
					}
				}
			});
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
	
	constructor (public originalError: Error) {
		super(originalError.message);
	}
}

export class MongoDocumentDoesNotExistError <T> extends Error {
	MongoDocumentDoesNotExist = 'MongoDocumentDoesNotExist';

	constructor (public criteria: FilterQuery<T>) {
		super('MongoDocument not found');
	}
}

export const insertOneDocument = <T extends MongoDocument> (collectionName: string) =>
	(document: UninsertedDocument<T>) =>
		dbCnx
			.map(db => db.collection(collectionName))
			.chain(mongoInsertOne<T>(document))
;

export const findOneDocument = <T extends MongoDocument> (collectionName: string) =>
	// TODO: fix typings
	(criteria: FilterQuery<T>) =>
		dbCnx
			.map(db => db.collection(collectionName))
			.chain(mongoFindOne(criteria))
;

export const isMongoError = isInstanceOf(MongoError, MongoInsertError);

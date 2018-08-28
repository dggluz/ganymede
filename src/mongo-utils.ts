import { Task } from '@ts-task/task';
import { share } from '@ts-task/utils';
import { MongoClient, MongoError, Collection } from 'mongodb';
import { Overwrite } from 'type-zoo/types';

// TODO: make structural typings for MongoErrors distinguible of just errors

export const createMongoConnection = (url: string) =>
	new Task<MongoClient, MongoError>((resolve, reject) => {
		MongoClient.connect(
			url, {
				useNewUrlParser: true
			}, (err, client) => {
				if (err) {
					reject(err);
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
export type MongoDocument <T> = Overwrite<T, {_id: MongoDocumentId}>

const mongoInsertOne = <T>  (document: T) =>
	(collection: Collection<T>) =>
		new Task<MongoDocument<T>, MongoError | MongoInsertError>((resolve, reject) => {
			collection
				.insertOne(document, (err, result) => {
					if (err) {
						reject(err);
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

const dbCnx = createMongoConnection('mongodb://localhost:27017')
	.map(client => client.db('sirena'))
	.pipe(share())
;


export class MongoInsertError extends Error {
	MongoInsertError = 'MongoInsertError';
}


export const insertOneDocument = <T> (collectionName: string, document: T) =>
	dbCnx
		.map(db => db.collection(collectionName))
		.chain(mongoInsertOne(document))
;

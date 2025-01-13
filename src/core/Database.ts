import { Collection, Db, Document, ClientSession, MongoClient } from "mongodb";
import { Model } from "./model";

export class Database {
    constructor(private db: Db) { }

    getCollection<T extends Document>(collectionName: string): Collection<T> {
        return this.db.collection<T>(collectionName);
    }

    getModel<T extends Document>(collectionName: string): Model<T> {
        return new Model<T>(new Database(this.db), collectionName);
    }

    getDatabase(): Db {
        return this.db;
    }


    async withTransaction(client: MongoClient, fn: (session: ClientSession) => Promise<void>): Promise<void> {
        const session = client.startSession();
        session.startTransaction();
        return fn(session)
            .then(() => session.commitTransaction())
            .catch((error) => {
                session.abortTransaction();
                throw error;
            })
            .finally(() => {
                session.endSession();
            });
    }
}
import { Collection, Db, Document, ClientSession, MongoClient } from "mongodb";
import { Model } from "./model";
import { ERROR_CODES, MongridError } from "../error/MongridError";

export class Database {
    constructor(private db: Db) { }

    getCollection<T extends Document>(collectionName: string): Collection<T> {
        return this.db.collection<T>(collectionName);
    }

    /**
     * Creates a new model for the specified collection.
     *
     * @param collectionName The name of the collection.
     * @returns {Model<T>} The model instance.
     */
    getModel<T extends Document>(collectionName: string): Model<T> {
        return new Model<T>(new Database(this.db), collectionName);
    }

/**
 * Returns the current database instance.
 *
 * @returns {Db} The MongoDB database instance.
 */

    getDatabase(): Db {
        return this.db;
    }


    async withTransaction<T>(client: MongoClient, fn: (session: ClientSession) => Promise<T>): Promise<T> {
        const session = client.startSession();
        session.startTransaction();
        return fn(session)
            .then((value:T)=>{
                session.commitTransaction()
                return value;
            })
            .catch((error) => {
                session.abortTransaction();
                throw new MongridError(
                    `Transaction failed: ${error.message}`,
                    ERROR_CODES.TRANSACTION_ERROR,
                    {error}
                )
            })
            .finally(() => {
                session.endSession();
            });
    }
}
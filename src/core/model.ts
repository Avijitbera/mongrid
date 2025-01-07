import { Collection, Db, Document } from 'mongodb'


class Model<T extends Document> {
    private collection: Collection<T>;
    private hooks: {[key in HookType]?: Array<Function>} = {};
    private validators: Array<(data:T) => boolean> = [];
    private indexs: Array<{key:any, option:any}> = [];

    /**
     * Construct a model class.
     * @param db The database connection.
     * @param collectionName The name of the collection.
     */
    constructor(private db: Db, collectionName: string) {
        this.collection = db.collection<T>(collectionName);
    }

}
import {MongoClient, Db, Collection} from 'mongodb'

export class BsonifyClient {
    private client: MongoClient;
    private db: Db | null = null;

    constructor(private uri: string) {
        this.client = new MongoClient(this.uri,
            {

            }
        );
    }

/**
 * Establishes a connection to the MongoDB server using the provided URI.
 * Sets the database instance for further operations.
 */

    async connect(): Promise<void>{
        await this.client.connect();
        this.db = this.client.db();
    }


}
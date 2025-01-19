import { Db, MongoClient } from "mongodb";
import { ERROR_CODES, MongridError } from "../error/MongridError";


export class Connection {
    private client: MongoClient;
    private db: Db | null = null;

    constructor(private uri: string){
        this.client = new MongoClient(this.uri);
    }

    async connect(dbName: string):Promise<void>{
        try {
            await this.client.connect();
            this.db = this.client.db(dbName);
        } catch (error) {
            throw new MongridError(
                `Failed to connect to database`,
                ERROR_CODES.DATABASE_CONNECTION_FAILED,
                {dbName, uri:this.uri}
            );
        }
    }

    getDatabase(): Db | null {
        if(!this.db) throw new Error("Database is not connected");
        return this.db;
    }

    getClient(): MongoClient {
        return this.client;
    }

    async disconnect():Promise<void>{
        try {
            await this.client.close();
            console.log("Database disconnected");
        } catch (error) {
            console.log('Error disconnecting from database');
            throw new MongridError(
                `Failed to disconnect`,
                ERROR_CODES.DATABASE_CONNECTION_FAILED
            );
        }
    }
}
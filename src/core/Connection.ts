import { Db, MongoClient } from "mongodb";


class Connection {
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
            throw error;
        }
    }

    getDatabase(): Db | null {
        if(!this.db) throw new Error("Database is not connected");
        return this.db;
    }

    async disconnect():Promise<void>{
        try {
            await this.client.close();
            console.log("Database disconnected");
        } catch (error) {
            console.log('Error disconnecting from database');
            throw error;
        }
    }
}
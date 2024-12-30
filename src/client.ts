import {Db, MongoClient} from 'mongodb'
import { Model } from './model/model';
import { BsonifyOptions } from './types/types';

export class BsonifyClient {
    private client: MongoClient | null = null
    private db: Db | null = null;
    private models: Map<string, Model<any>> = new Map()

    constructor(private readonly options: BsonifyOptions){}

    /**
     * Establishes a connection to the MongoDB database specified in the
     * constructor options.
     *
     * @throws {Error} If the connection attempt fails.
     */
    async connect():Promise<void> {
        try {
            this.client = await MongoClient.connect(this.options.url)
            this.db = this.client.db(this.options.database)
        } catch (error) {
            throw new Error('Failed to connect to database')
        }
    }

    /**
     * Closes the connection to the MongoDB database and releases all
     * resources. Should be called when the client is no longer needed.
     */
    async disconnect(): Promise<void>{
        if(this.client){
            await this.client.close()
            this.client = null;
            this.db = null;
        }
    }

    /**
     * Gets the underlying MongoDB database instance.
     * 
     * @throws {Error} If the database connection has not been established.
     * 
     * @returns The underlying MongoDB database instance.
     */
    getDatabase():Db{
        if(!this.db){
            throw new Error('Database connection not established');
        }
        return this.db;
    }

    /**
     * Register a model to be used with BsonifyClient.
     * 
     * @param name The name of the model. This is used to identify the model in the 
     * {@link BsonifyClient} instance.
     * 
     * @param model The model to register.
     */
    registerModel(name:string, model:Model<any>):void{
        this.models.set(name, model)
    }
}
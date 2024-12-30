import {Db, MongoClient} from 'mongodb'
import { Model } from './model/model';

export class BsonifyClient {
    private client: MongoClient | null = null
    private db: Db | null = null;
    private models: Map<string, Model<any>> = new Map()
}
import { Db, MongoClient } from "mongodb";
import dotenv from 'dotenv'
dotenv.config()

let db: Db;

const uri = process.env.MONGO_URI;
const dbName = `bsonify_temp_2`;

export async function connect() {
    if(db) return db;
   
    const client = new MongoClient(uri!);
    await client.connect();
    db = client.db(dbName);
    return db;
}

export async function cleanup(): Promise<void> {
    if (db) {
        // await db.dropDatabase();
    }
}
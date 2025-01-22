import { Db, MongoClient } from "mongodb";


let db: Db;

const uri = process.env.MONGO_URI;
const dbName = `bsonify`;

export async function connect() {
    if(db) return db;

    const client = new MongoClient(uri!);
    await client.connect();
    db = client.db(dbName);
    return db;
}
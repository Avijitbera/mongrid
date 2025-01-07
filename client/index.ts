import { MongoClient } from "mongodb";
import { UserModel } from "./UserModel";
import dotenv from "dotenv";
import { dot } from "node:test/reporters";

const main = async() =>{
    dotenv.config();
    const user = process.env.MONGO_DB_USER
    const password = process.env.MONGO_DB_PASS
    const client = new MongoClient(`mongodb+srv://${user}:${password}@cluster0.x8mcxdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
    await client.connect();
    const db = client.db("bsonify");

    const userModel = new UserModel(db);

   const id = await userModel.save({
        age: 20,
        name: "test12",
        email: "test12@mail.com"
    })
    console.log(id);
}

main()
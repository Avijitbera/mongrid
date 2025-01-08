import { MongoClient } from "mongodb";
import { UserModel } from "./UserModel";
import dotenv from "dotenv";
import {Connection} from '../src/core/Connection'
import { Database } from "../src/core/Database";


const main = async() =>{
    dotenv.config();
    const user = process.env.MONGO_DB_USER
    const password = process.env.MONGO_DB_PASS
    const connection = new Connection(`mongodb+srv://${user}:${password}@cluster0.x8mcxdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
    await connection.connect('bsonify');
    const db = new Database(connection.getDatabase()!);

    const userModel = new UserModel(db);

   const id = await userModel.save({
        age: 21,
        name: "test122",
        email: "test122@mail.com"
    })
    console.log(id);
}

main()


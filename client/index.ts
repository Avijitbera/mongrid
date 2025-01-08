import { MongoClient } from "mongodb";
import { Account, UserModel } from "./UserModel";
import dotenv from "dotenv";
import {Connection} from '../src/core/Connection'
import { Database } from "../src/core/Database";
import {ModelBuilder} from '../src/core/ModelBuilder'
import { HookType } from "../src/core/hooks/HookType";
import { Hook } from "../src/core/hooks/Hook";
import { Field } from "../src/core/fields/Field";
import { FieldBuilder } from "../src/core/fields/FieldBuilder";
import { exit } from "process";

const main = async() =>{
    dotenv.config();
    const user = process.env.MONGO_DB_USER
    const password = process.env.MONGO_DB_PASS
    const connection = new Connection(`mongodb+srv://${user}:${password}@cluster0.x8mcxdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
    await connection.connect('bsonify');
    const db = new Database(connection.getDatabase()!);

    const accountModel = new ModelBuilder<Account>(db, 'account')
    .addField("name", new FieldBuilder<string>("name").required().type(String).build())
    .addField("email", new FieldBuilder<string>("email").type(String).unique().required().build())
    .addField("imageUrl", new FieldBuilder<string>("imageUrl").required().type(String).build())
    .addField('isVerified', new FieldBuilder<boolean>("isVerified").default(false).type(Boolean).build())
    .addField('createdAt', new FieldBuilder<Date>("createdAt").default(new Date()).type(Date).build())
    .build();

    const id = await accountModel.save({
        age:34,
        email:"mail1@mail.com",
        imageUrl:"imageUrl",
        name:"test",

    })
    console.log(id)
    exit(0)
   
}

main()


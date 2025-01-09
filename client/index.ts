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
import { NestedField } from "../src/core/fields/NestedField";

const main = async() =>{
    dotenv.config();
    const user = process.env.MONGO_DB_USER
    const password = process.env.MONGO_DB_PASS
    const connection = new Connection(`mongodb+srv://${user}:${password}@cluster0.x8mcxdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
    await connection.connect('bsonify');
    const db = new Database(connection.getDatabase()!);

    const addressField = new NestedField<object>("address")
    .addField("city", new FieldBuilder<string>("city").required().type(String).build())
    .addField("state", new FieldBuilder<string>("state").required().type(String).build())
    .addField("country", new FieldBuilder<string>("country").required().type(String).build())
    

    const accountModel = new ModelBuilder<Account>(db, 'accounts')
    .addField("name", new FieldBuilder<string>("name").required().type(String).build())
    .addField("email", new FieldBuilder<string>("email").type(String).unique().required().build())
    .addField("imageUrl", new FieldBuilder<string>("imageUrl").required().type(String).build())
    .addField('isVerified', new FieldBuilder<boolean>("isVerified").default(false).type(Boolean).build())
    .addField('createdAt', new FieldBuilder<Date>("createdAt").default(new Date()).type(Date).build())
    .addField('age', new FieldBuilder<number>("age").required().type(Number).build())
    .addField("type", new FieldBuilder<string>("type").type(String).default("user").build())
    .addNestedField("address", addressField)
    .build();

    const id = await accountModel.save({
        age:34,
        email:"mail211@mail.com",
        imageUrl:"imageUrl",
        name:"test",
        address:{
            // city:"city12",
            state:"state1200",
            country:"country1200"
        }

    })
    console.log(id)
    exit(0)
   
}

main()


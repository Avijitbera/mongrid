import { ClientSession, MongoClient } from "mongodb";
import { Account, Post, UserModel } from "./UserModel";
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
import { Validator } from "../src/core/validators/Validator";
import {ObjectId} from '../src/types/index'
class EmailAndAgeValidator<T extends Account> extends Validator<T> {
    validate(document: T): { email?: string[]; age?: string[] } {
        const errors: { email?: string[]; age?: string[] } = {};

        // Validate email
        const emailErrors: string[] = [];
        if (!document.email.includes('@')) {
            emailErrors.push('Email must contain "@"');
        }
        if (!document.email.endsWith('.com')) {
            emailErrors.push('Email must end with ".com"');
        }
        if (emailErrors.length > 0) {
            errors.email = emailErrors;
        }

        // Validate age
        const ageErrors: string[] = [];
        if (document.age < 18) {
            ageErrors.push('Age must be at least 18');
        }
        if (document.age > 100) {
            ageErrors.push('Age must be at most 100');
        }
        if (ageErrors.length > 0) {
            errors.age = ageErrors;
        }

        return errors;
    }
}

class LogSaveHook<T> implements Hook<T>{
    async execute(data: T): Promise<void> {
        console.log(`Saving data: ${JSON.stringify(data)}`);
    }
}

const main = async() =>{
    dotenv.config();
    const user = process.env.MONGO_DB_USER
    const password = process.env.MONGO_DB_PASS
    const connection = new Connection(`mongodb+srv://${user}:${password}@cluster0.x8mcxdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
    const dbName = `bsonify`;
    await connection.connect(dbName);
    const db = new Database(connection.getDatabase()!);
    var result = await db.withTransaction<string>(connection.getClient(), async (session: ClientSession) => {
        const accounts = db.getCollection("user");
        await accounts.insertOne({ name: "Alice", balance: 1000 }, { session });
        console.log("Transaction successful");
        return "Success"
    }
    )
    console.log({result})
    // await db.getDatabase().createCollection("posts");

    const addressField = new NestedField<object>("address")
    .addField("city", new FieldBuilder<string>("city").required().type(String).build())
    .addField("state", new FieldBuilder<string>("state").required().type(String).build())
    .addField("country", new FieldBuilder<string>("country").required().type(String).build())
    

   

    const accountModel = new ModelBuilder<Account>(db, 'accounts')
    .addField("name", new FieldBuilder<string>("name").required().type(String).build())
    .addField("email", new FieldBuilder<string>("email").type(String).unique().required()
    .build())
    .addField("imageUrl", new FieldBuilder<string>("imageUrl").required().type(String).build())
    .addField('isVerified', new FieldBuilder<boolean>("isVerified").default(false).type(Boolean).build())
    .addField('createdAt', new FieldBuilder<Date>("createdAt").default(new Date()).type(Date).build())
    .addField('age', new FieldBuilder<number>("age").required().type(Number).build())
    .addField("type", new FieldBuilder<string>("type").type(String).default("user").build())
    .addNestedField("address", addressField)
    .addHook(HookType.PostSave, new LogSaveHook())
    .addValidator(new EmailAndAgeValidator())
    .build();

    const postModel = new ModelBuilder<Post>(db, 'posts')
    .addField('title', new FieldBuilder<string>("title").required().type(String).build())
    .addField('content', new FieldBuilder<string>("content").required().type(String).build())
    .addField('author', new FieldBuilder<ObjectId>("author").required().type(ObjectId).build()) 
    .addOneToOne("author", accountModel, 'author', false)
    .build();

    

    const id = await accountModel.save({
        age:34,
        email:"mail5114@mail.com",
        imageUrl:"imageUrl",
        name:"test",
        address:{
            city:"city12",
            state:"state1200",
            country:"country1200"
        }

    })
    console.log({id})

    try {
        const postId = await postModel.save({
            content: "This is test12",
            title: "Test 1234",
            author: id
        }, );
        console.log({ postId });
    } catch (error:any) {
        
    }
    // const postId = await postModel.save({
    //     content:"This is test12",
    //     title:"Test 1234",
    //     author:id,


    // })
   
    // console.log({postId})
    exit(0)
   
}

main()


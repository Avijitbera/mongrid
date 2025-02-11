import { Database, FieldBuilder, Model } from "../src";
import { connect } from "./db";


interface User {
    id: string;
    name: string;
    age: number;
    email: string;
}

describe("QueryBuilder Tests", () =>{
    let db: Database;
    let userModel: Model<User>;

    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        userModel = new Model<User>(db, "users")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("name", new FieldBuilder<string>("name").type(String).required().build())
            .addField("age", new FieldBuilder<number>("age").type(Number).build())
            .addField("email", new FieldBuilder<string>("email").type(String).unique().build());
    });
    
})
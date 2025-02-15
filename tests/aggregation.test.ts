
import { FieldBuilder, Model } from '../src';
import { Database } from '../src/core/Database';
import {User} from '../tests/model/user.model'
import { connect } from './db';


describe("Type-Safe Aggregation Tests", () => {
    let db: Database;
    let userModel: Model<User>;

    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        userModel = new Model<User>(db, "users")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("name", new FieldBuilder<string>("name").type(String).required().build())
            .addField("age", new FieldBuilder<number>("age").type(Number).build());
    });
})

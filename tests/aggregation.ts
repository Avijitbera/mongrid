
import { FieldBuilder, Model } from '../src';
import { Database } from '../src/core/Database';
import { QueryBuilder } from '../src/core/QueryBuilder';
import {User} from './model/user.model'
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

    afterAll(async () => {
        // await cleanup();
    });

    it("should perform type-safe aggregation", async () => {
        await userModel.save({ id: "1", name: "John",  });
        await userModel.save({ id: "2", name: "Jane",  });
        await userModel.save({ id: "3", name: "Alice",  });

        const queryBuilder = new QueryBuilder<User>(userModel)
        .group({
            _id:"$age",
            count:{$sum:1}
        })
        .sortBy({count: -1})
    })
})

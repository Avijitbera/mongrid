import { Database, FieldBuilder, Model } from "../src";
import { QueryBuilder } from "../src/core/QueryBuilder";
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

    afterAll(async () => {
        await userModel.delete({}); // Clean up the collection after tests
    });

    it("should filter documents using where clause", async () => {
        // Insert test data
        await userModel.save({ id: "1", name: "John Doe", age: 30, email: "john@example.com" });
        await userModel.save({ id: "2", name: "Jane Doe", age: 25, email: "jane@example.com" });

        // Query with filter
        const queryBuilder = new QueryBuilder<User>(userModel)
            .where("name", "equal", "John Doe");

        const results = await queryBuilder.execute();
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe("John Doe");
    });

    it("should sort documents", async () => {
        // Insert test data
        await userModel.save({ id: "3", name: "Alice", age: 20, email: "alice@example.com" });
        await userModel.save({ id: "4", name: "Bob", age: 35, email: "bob@example.com" });

        // Query with sorting
        const queryBuilder = new QueryBuilder<User>(userModel)
            .sortBy({ age: 1 }); // Sort by age in ascending order

        const results = await queryBuilder.execute();
        expect(results).toHaveLength(2);
        expect(results[0].name).toBe("Alice"); // Alice is younger
        expect(results[1].name).toBe("Bob"); // Bob is older
    });

    it("should paginate documents", async () => {
        // Insert test data
        await userModel.save({ id: "5", name: "Charlie", age: 40, email: "charlie@example.com" });
        await userModel.save({ id: "6", name: "David", age: 45, email: "david@example.com" });

        // Query with pagination
        const queryBuilder = new QueryBuilder<User>(userModel)
            .paginate(1, 1); // Page 1, 1 document per page

        const results = await queryBuilder.execute();
        expect(results).toHaveLength(1);
    });
    
})
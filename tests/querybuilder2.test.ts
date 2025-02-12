import { Database, FieldBuilder, Model } from "../src";
import { QueryBuilder } from "../src/core/QueryBuilder";
import { connect } from "./db";


interface User {
    id: string;
    name: string;
    age: number;
    email: string;
    location?: { type: string; coordinates: [number, number] };
    description?: string;
}


describe("QueryBuilder 2 Tests", () =>{
    let db: Database;
    let userModel: Model<User>;

    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        userModel = new Model<User>(db, "profiles")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("name", new FieldBuilder<string>("name").type(String).required().build())
            .addField("age", new FieldBuilder<number>("age").type(Number).build())
            .addField("email", new FieldBuilder<string>("email").type(String).unique().build())
            .addField("location", new FieldBuilder<any>("location").type(Object).build())
            .addField("description", new FieldBuilder<string>("description").type(String).build());
    });

    afterAll(async () => {
        await userModel.delete({}); // Clean up the collection after tests
    });

    it("should filter documents using where clause", async () => {
        await userModel.save({ id: "1", name: "John Doe", age: 30, email: "john@example.com" });
        await userModel.save({ id: "2", name: "Jane Doe", age: 25, email: "jane@example.com" });

        const queryBuilder = new QueryBuilder<User>(userModel)
            .where("name", "equal", "John Doe");

        const results = await queryBuilder.execute();
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe("John Doe");
    });

   

})
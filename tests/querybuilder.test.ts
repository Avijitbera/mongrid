import { ObjectId } from "mongodb";
import { Database, FieldBuilder, Model } from "../src";
import { QueryBuilder } from "../src/core/QueryBuilder";
import { RelationshipMetadata, RelationshipType } from "../src/core/relationships/RelationshipType";
import { connect } from "./db";
import { Post } from "./model/post.model";


interface User {
    id: string;
    name: string;
    age: number;
    email: string;
    posts?: Post[]
}

describe("QueryBuilder Tests", () =>{
    let db: Database;
    let userModel: Model<User>;

    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        userModel = new Model<User>(db, "users10")
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
        .where("name", "in", ["Alice", "Bob"])
            .sortBy({ age: 1 }); // Sort by age in ascending order

        const results = await queryBuilder.execute();
        expect(results).toHaveLength(2);
        expect(results[0].name).toBe("Alice"); // Alice is younger
        expect(results[1].name).toBe("Bob"); // Bob is older
    });

    it("should paginate documents", async () => {
        // Clear the collection before inserting test data
        await userModel.delete({});
    
        // Insert test data
        await userModel.save({ id: "5", name: "Charlie", age: 40, email: "charlie@example.com" });
    await userModel.save({ id: "6", name: "David", age: 45, email: "david@example.com" });

    // Query with pagination
    const queryBuilder = new QueryBuilder<User>(userModel)
        .paginate(1, 1); // Page 1, 1 document per page

    const results = await queryBuilder.execute();

    // Assertions
    expect(results).toHaveLength(1);// Ensure only 1 document is returned
    });

    it("should populate related documents", async () => {
        // Create a related model (e.g., posts)
        const postModel = new Model<Post>(db, "posts10")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("title", new FieldBuilder<string>("title").type(String).required().build())
            .addField("userId", new FieldBuilder<string>("userId").type(String).required().build());

        // Define a relationship between users and posts
        userModel.addRelationship("posts", new RelationshipMetadata(
            RelationshipType.OneToMany,
            postModel,
            "userId"
        ));

        // Insert test data
        const userId = await userModel.save({ id: "7", name: "Eve", age: 50, email: "eve@example.com" });
        await postModel.save({ id: "post1", title: "First Post", userId: new ObjectId(userId) });

        // Query with populated posts
        const queryBuilder = new QueryBuilder<User>(userModel)
            .whereId(new ObjectId(userId))
            .populate("posts");

        const userWithPosts = await queryBuilder.executeOne();
        expect(userWithPosts).toBeDefined();
        expect(userWithPosts?.posts).toBeInstanceOf(Array);
        expect(userWithPosts?.posts).toHaveLength(1);
        expect(userWithPosts?.posts![0].title).toBe("First Post");
    });

    it("should count documents", async () => {
        // Insert test data
        await userModel.save({ id: "8", name: "Frank", age: 55, email: "frank@example.com" });

        // Query to count documents
        const queryBuilder = new QueryBuilder<User>(userModel);
        const count = await queryBuilder.count();

        expect(count).toBeGreaterThanOrEqual(1);
    });

    it("should explain the query execution plan", async () => {
        const queryBuilder = new QueryBuilder<User>(userModel)
            .where("age", "greaterThan", 30);

        const explain = await queryBuilder.explain();
        expect(explain).toBeDefined();
        expect(explain.queryPlanner).toBeDefined();
    });

    // it("should execute an aggregation pipeline", async () => {
    //     // Insert test data
    //     await userModel.save({ id: "9", name: "Grace", age: 60, email: "grace@example.com" });

    //     // Query with aggregation
    //     const queryBuilder = new QueryBuilder<User>(userModel)
    //         .aggregate([{ $match: { age: { $gt: 30 } } }]);

    //     const results = await queryBuilder.execute();
    //     expect(results).toHaveLength(1);
    //     expect(results[0].name).toBe("Grace");
    // });

    it("should handle non-existent documents gracefully", async () => {
        const queryBuilder = new QueryBuilder<User>(userModel)
            .whereId(new ObjectId()); // Non-existent ID

        const result = await queryBuilder.executeOne();
        expect(result).toBeNull();
    });
    
})
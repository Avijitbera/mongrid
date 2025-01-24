import { ObjectId } from "mongodb";
import { Database, Model } from "../src"
import { RelationshipMetadata, RelationshipType } from "../src/core/relationships/RelationshipType";
import { cleanup, connect } from "./db";
import { createPostModel, Post } from "./model/post.model";
import { createUserModel, User } from "./model/user.model";


describe("Relationship Tests", () =>{
    let db: Database;
    let userModel: Model<User>;
    let postModel: Model<Post>;

    afterAll(async () => {
        await cleanup();
    });

    beforeAll(async() =>{
        const mongoDb = await connect();
        db = new Database(mongoDb);
        userModel = createUserModel(db);
        postModel = createPostModel(db);

        userModel.addRelationship('posts',
            new RelationshipMetadata(
                RelationshipType.OneToMany,
                postModel,
                'userId'
            )
        )

        postModel.addRelationship('user',
            new RelationshipMetadata(
                RelationshipType.OneToOne,
                userModel,
                'userId'
            )
        )
    })

    it("should save and retrieve a one-to-many relationship", async () => {
        // Save a user
        const userId = await userModel.save({
            id: "user1",
            name: "Alice",
        });
    console.log({userId})
        // Save posts for the user
        await postModel.save({
            id: "post1",
            title: "First Post",
            userId: "user1",
        });

        await postModel.save({
            id: "post2",
            title: "Second Post",
            userId: "user1",
        });

        // Retrieve the user with populated posts
        const userWithPosts = await userModel.findById(new ObjectId(userId), ["posts"]);
        console.log({userWithPosts})
        // Assertions
        expect(userWithPosts).toBeDefined();
        expect(userWithPosts?.posts).toHaveLength(2);
        expect(userWithPosts?.posts![0].title).toBe("First Post");
        expect(userWithPosts?.posts![1].title).toBe("Second Post");
    });

})
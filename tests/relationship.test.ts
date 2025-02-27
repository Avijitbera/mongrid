import { ObjectId } from "mongodb";
import { Database, FieldBuilder, Model } from "../src";

import {connect} from './db'
import { RelationshipMetadata, RelationshipType } from "../src/core/relationships/RelationshipType";

interface User {
    id: string;
    name: string;
    posts?: Post[]; // One-to-many relationship with Post
}

interface Post {
    id: string;
    title: string;
    userId: ObjectId; // Foreign key to User
    user?: User; // One-to-one relationship with User
}

describe("Relationship Tests", () => {
    let db: Database;
    let userModel: Model<User>;
    let postModel: Model<Post>;

    beforeAll(async () =>{
        const mongodb = await connect();
        db = new Database(mongodb);

        // Define User model
        userModel = new Model<User>(db, "users")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("name", new FieldBuilder<string>("name").type(String).required().build());

        // Define Post model
        postModel = new Model<Post>(db, "posts")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("title", new FieldBuilder<string>("title").type(String).required().build())
            .addField("userId", new FieldBuilder<ObjectId>("userId").type(ObjectId).required().build());
   
            userModel.addRelationship("posts", new RelationshipMetadata(
                RelationshipType.OneToMany,
                postModel,
                "userId" // Foreign key in the Post model
            ));
    
            postModel.addRelationship("user", new RelationshipMetadata(
                RelationshipType.OneToOne,
                userModel,
                "userId" // Foreign key in the Post model
            ));
        })

        it("should save and retrieve a one-to-many relationship (User -> Posts)", async () => {
            // Save a user
            const userId = await userModel.save({
                id: "user1",
                name: "Alice",
            });
    
            // Save posts for the user
            await postModel.save({
                id: "post1",
                title: "First Post",
                userId: new ObjectId(userId), // Link to the user
            });
    
            await postModel.save({
                id: "post2",
                title: "Second Post",
                userId: new ObjectId(userId), // Link to the user
            });
    
            // Retrieve the user with populated posts
            const userWithPosts = await userModel.findById(new ObjectId(userId), ["posts"]);
    
            // Assertions
            expect(userWithPosts).toBeDefined();
            expect(userWithPosts?.posts).toBeInstanceOf(Array); // Ensure posts is an array
            expect(userWithPosts?.posts).toHaveLength(2); // Ensure there are 2 posts
            expect(userWithPosts?.posts![0].title).toBe("First Post");
            expect(userWithPosts?.posts![1].title).toBe("Second Post");
        });

        it("should save and retrieve a one-to-one relationship (Post -> User)", async () => {
            // Save a user
            const userId = await userModel.save({
                id: "user2",
                name: "Bob",
            });
    
            // Save a post for the user
            const postId = await postModel.save({
                id: "post3",
                title: "Third Post",
                userId: new ObjectId(userId), // Link to the user
            });
    
            // Retrieve the post with populated user
            const postWithUser = await postModel.findById(new ObjectId(postId), ["user"]);
    
            // Assertions
            expect(postWithUser).toBeDefined();
            expect(postWithUser?.user).toBeDefined(); // Ensure user is populated
            expect(postWithUser?.user?.id).toBe("user2"); // Ensure the correct user is linked
            expect(postWithUser?.user?.name).toBe("Bob");
        });

        it("should handle non-existent relationships gracefully", async () => {
            // Save a user without any posts
            const userId = await userModel.save({
                id: "user3",
                name: "Charlie",
            });
    
            // Retrieve the user with populated posts (should be an empty array)
            const userWithPosts = await userModel.findById(new ObjectId(userId), ["posts"]);
            expect(userWithPosts).toBeDefined();
            expect(userWithPosts?.posts).toBeInstanceOf(Array); // Ensure posts is an array
            expect(userWithPosts?.posts).toHaveLength(0); // Ensure there are no posts
    
            // Save a post without a valid user (invalid userId)
            const postId = await postModel.save({
                id: "post4",
                title: "Orphan Post",
                userId: new ObjectId(), // Invalid userId
            });
    
            // Retrieve the post with populated user (should be null)
            const postWithUser = await postModel.findById(new ObjectId(postId), ["user"]);
            expect(postWithUser).toBeDefined();
            expect(postWithUser?.user).toBeNull(); // Ensure user is null
        });
})
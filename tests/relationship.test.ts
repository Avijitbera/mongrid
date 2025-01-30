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
// Define relationships
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

    it("should save and retrieve a one-to-many relationship", async () => {
        // Save a user
        
        const userId = await userModel.save({
            id: "user2",
            name: "Alice1",
        });

       

        // Save posts for the user
        await postModel.save({
            id: "post01",
            title: "First Post 01",
            userId: new ObjectId(userId), // Use the userId returned from saving the user
        });

        await postModel.save({
            id: "post02",
            title: "Second Post 02",
            userId: new ObjectId(userId), // Use the userId returned from saving the user
        });

        // Retrieve the user with populated posts
        const userWithPosts = await userModel.findById(new ObjectId(userId), ["posts"]);

        

        // Assertions
        expect(userWithPosts).toBeDefined();
        expect(userWithPosts?.posts).toBeInstanceOf(Array); // Ensure posts is an array
        expect(userWithPosts?.posts).toHaveLength(2); // Ensure there are 2 posts
        expect(userWithPosts?.posts![0].title).toBe("First Post 01");
        expect(userWithPosts?.posts![1].title).toBe("Second Post 02");
        
    }, 10000);

    it("should retrieve a post with its associated user (One-to-One)", async () => {
        const userId = await userModel.save({
            id: "user1",
            name: "Alice",
        });
    
        // Save a post for the user
        const postId = await postModel.save({
            id: "post1",
            title: "First Post",
            userId: new ObjectId(userId), // Ensure userId is an ObjectId
        });
    
        // Retrieve the post with its associated user
        const postWithUser = await postModel.findById(new ObjectId(postId), ["user"]);
    
    

    // Assertions
    expect(postWithUser).toBeDefined();
    expect(postWithUser?.user).toBeDefined();
    expect(postWithUser?.user?.id).toBe("user1");
    expect(postWithUser?.user?.name).toBe("Alice");
    }, 10000)

    it("should handle non-existent relationships gracefully", async () => {
        // Save a user without any posts
        const userId = await userModel.save({
            id: "user1",
            name: "Alice",
        });
    
        // Retrieve the user with populated posts
        const userWithPosts = await userModel.findById(new ObjectId(userId), ["posts"]);
        expect(userWithPosts).toBeDefined();
        expect(userWithPosts?.posts).toBeInstanceOf(Array); // Ensure posts is an array
        expect(userWithPosts?.posts).toHaveLength(0); 

        // Save a post without a user (invalid userId)
    const postId = await postModel.save({
        id: "post1",
        title: "Orphan Post",
        userId: new ObjectId(), // Invalid userId
    });

    // Retrieve the post with its associated user
    const postWithUser = await postModel.findById(new ObjectId(postId), ["user"]);

    // Log the result for debugging
   

    // Assertions
    expect(postWithUser).toBeDefined();
    expect(postWithUser?.user).toBeNull(); // Ensure user is null // Ensure user is null
    }, 10000);

})
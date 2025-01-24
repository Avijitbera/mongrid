import { Database, Model } from "../src"
import { RelationshipMetadata, RelationshipType } from "../src/core/relationships/RelationshipType";
import { connect } from "./db";
import { createPostModel, Post } from "./model/post.model";
import { createUserModel, User } from "./model/user.model";


describe("Relationship Tests", () =>{
    let db: Database;
    let userModel: Model<User>;
    let postModel: Model<Post>;

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

})
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
})
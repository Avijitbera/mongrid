import { Database, FieldBuilder, Model } from "../../src";
import { User } from "./user.model";

export interface Post {
    id:string;
    title:string;
    userId:string;
    user?:User;
}

export function createPostModel(db: Database): Model<Post> {
    return new Model<Post>(db, "posts")
        .addField("id", new FieldBuilder<string>("id").type(String).required().build())
        .addField("title", new FieldBuilder<string>("title").type(String).required().build())
        .addField("userId", new FieldBuilder<string>("userId").type(String).required().build());
}
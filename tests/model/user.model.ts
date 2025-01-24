import { Database, FieldBuilder, Model } from "../../src";
import { Post } from "./post.model";

export interface User {
    id:string;
    name: string;
    posts?: Post[]
}

export function createUserModel(db: Database): Model<User> {
    return new Model<User>(db, "users")
        .addField("id", new FieldBuilder<string>("id").type(String).required().build())
        .addField("name", new FieldBuilder<string>("name").type(String).required().build());
}
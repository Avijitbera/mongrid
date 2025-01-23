import { Database, FieldBuilder, Model } from "../../src";

export interface User {
    id:string;
    name: string;
}

export function createUserModel(db: Database): Model<User> {
    return new Model<User>(db, "users")
        .addField("id", new FieldBuilder<string>("id").type(String).required().build())
        .addField("name", new FieldBuilder<string>("name").type(String).required().build());
}
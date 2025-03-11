import {Model, FieldBuilder} from '../../../src/index'
export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
    profilePicture?: string;
    followersCount: number;
    followingCount: number;
}

export function createUserModel(db: any): Model<User> {
    return new Model<User>(db, "users")
        .addField("id", new FieldBuilder<string>("id").type(String).required().build())
        .addField("username", new FieldBuilder<string>("username").type(String).required().unique().build())
        .addField("email", new FieldBuilder<string>("email").type(String).required().unique().build())
        .addField("password", new FieldBuilder<string>("password").type(String).required().build())
        .addField("bio", new FieldBuilder<string>("bio").type(String).build())
        .addField("profilePicture", new FieldBuilder<string>("profilePicture").type(String).build())
        .addField("followersCount", new FieldBuilder<number>("followersCount").type(Number).default(0).build())
        .addField("followingCount", new FieldBuilder<number>("followingCount").type(Number).default(0).build());
}
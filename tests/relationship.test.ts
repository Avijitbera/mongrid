import { ObjectId } from "mongodb";
import { Database, Model } from "../src";



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
})
import { Db, ObjectId } from "mongodb";
import {Model} from '../src/core/model'
import { Database } from "../src/core/Database";
export type User = {
    // _id?: ObjectId;
    name: string;
    email: string;
    age: number;
};

export class UserModel extends Model<User> {
    constructor(db: Database) {
        super(db, 'users');
    }
}
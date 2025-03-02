import { ObjectId } from "mongodb";
import { Database, Model } from "../../src";
import {connect} from '../db'

interface User extends Document {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}


describe("Timestamp Plugin Tests", () => {
    let db: Database;
    let userModel: Model<User>;

    beforeAll(async() =>{
        const mongodb = await connect();
        db = new Database(mongodb);
    })

    
})
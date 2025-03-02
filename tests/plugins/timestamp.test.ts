import { ObjectId, Document } from "mongodb";
import { Database, FieldBuilder, Model, TimestampPlugin } from "../../src";
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

        userModel = new Model<User>(db, "users")
        .addField("id", new FieldBuilder<string>("id").type(String).required().build())
        .addField("name", new FieldBuilder<string>("name").type(String).required().build());

    // Install the TimestampPlugin
    userModel.use(new TimestampPlugin<User>());
    })


    afterAll(async () => {
        await userModel.delete({}); // Clean up the collection after tests
    });

    it("should add createdAt and updatedAt fields when saving a document", async() =>{
        const userId = await userModel.save({
            id: "1",
            name: "John Doe",
        });

        // Retrieve the user
        const user = await userModel.findById(new ObjectId(userId));

        
        // Assertions
        expect(user).toBeDefined();
        expect(user?.createdAt).toBeInstanceOf(Date); // Ensure createdAt is set
        expect(user?.updatedAt).toBeInstanceOf(Date); 
    })

    it("should update the updatedAt field when updating a document", async() =>{
        const userId = await userModel.save({
            id: "2",
            name: "Jane Doe",
        });

        // Retrieve the user
        const user = await userModel.findById(new ObjectId(userId));
        expect(user).toBeDefined();

        // Wait for a short time to ensure the updatedAt timestamp changes
        await new Promise((resolve) => setTimeout(resolve, 100));
        await userModel.updateById(new ObjectId(userId), { name: "Jane Smith" });

        // Retrieve the updated user
        const updatedUser = await userModel.findById(new ObjectId(userId));

        // Assertions
        expect(updatedUser).toBeDefined();
        expect(updatedUser?.updatedAt).toBeInstanceOf(Date); // Ensure updatedAt is set
        expect(updatedUser?.updatedAt).not.toEqual(user?.updatedAt);
    })


})
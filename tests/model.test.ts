import {cleanup, connect} from './db'
import {Database, FieldBuilder, Model} from '../src'
import dotenv from 'dotenv'
import { ObjectId } from '../src/types';
dotenv.config()
interface User {
    id: string;
    name: string;
    age: number;
}

describe('Model - Save and Get', () =>{
    let db: Database;
    let userModel: Model<User>;

    beforeAll(async() =>{
        const mongodb = await connect()
        db = new Database(mongodb)

        userModel = new Model<User>(db, "users1")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("name", new FieldBuilder<string>("name").type(String).required().build())
            .addField("age", new FieldBuilder<number>("age").type(Number).build());

    })

    afterAll(async () => {
        await cleanup();
    });

    it('Should save and get a user by ID', async () => {
        const userId = await userModel.save({
            id: "123",
            name: "John Doe",
            age: 30,
        
        })

        const user = await userModel.findById(userId);

        expect(user).toBeDefined()
        expect(user?.id).toBe("123")
        expect(user?.name).toBe("John Doe")
        expect(user?.age).toBe(30)

    })

    it("should throw an error when saving a document with missing required fields", async () => {
        // Attempt to save a document without the required "name" field
        await expect(
            userModel.save({
                id: "789",
                age: 40,
            } as any) // Cast to "any" to bypass TypeScript checks for testing
        ).rejects.toThrow("Missing required field: name");
    });
    it("should return null when trying to retrieve a non-existent document", async () => {
        // Attempt to retrieve a document with a non-existent ID
        const user = await userModel.findById(new ObjectId());

        // Assertions
        expect(user).toBeNull();
    });
})
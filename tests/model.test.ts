import {cleanup, connect} from './db'
import {Database, FieldBuilder, Model} from '../src'
import dotenv from 'dotenv'
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

        userModel = new Model<User>(db, "users")
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
})
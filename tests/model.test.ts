import {Database, Model} from '../src'
interface User {
    id: string;
    name: string;
    age: number;
}

describe('Model - Save and Get', () =>{
    let db: Database;
    let userModel: Model<User>;

    
})
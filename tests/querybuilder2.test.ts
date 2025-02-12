import { Database, Model } from "../src";


interface User {
    id: string;
    name: string;
    age: number;
    email: string;
    location?: { type: string; coordinates: [number, number] };
    description?: string;
}


describe("QueryBuilder 2 Tests", () =>{
    let db: Database;
    let userModel: Model<User>;

})
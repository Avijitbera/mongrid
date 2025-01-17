import { Connection } from "../src/core/Connection"
import { Database } from "../src/core/Database";

describe("Testing the connection String", () => {
    let connection: Connection;
    let db: Database;
    let url = process.env.MONGO_URL || "mongodb://localhost:27017";
    let dbname = "test";

    beforeAll(async () => {
        connection = new Connection(url);
        await connection.connect(dbname);
        db = new Database(connection.getDatabase()!)
    })

    it("Should connect to the database", () => {
        const database = connection.getDatabase();
        expect(database).toBeDefined()
        expect(database?.databaseName).toBe(dbname)
    })

    afterAll(async () => {
        await connection.disconnect()
    })
})
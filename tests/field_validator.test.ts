import dotenv from 'dotenv';
import { Database } from '../src/core/Database';
import { Model, FieldBuilder } from '../src';
import {connect} from './db'
dotenv.config();

interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

describe('Field Validation Tests', () => {
    let db: Database;
    let productModel: Model<Product>;

    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        productModel = new Model<Product>(db, "products")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("name", new FieldBuilder<string>("name").type(String).required().build())
            .addField("price", new FieldBuilder<number>("price").type(Number).required().build())
            .addField("quantity", new FieldBuilder<number>("quantity").type(Number).required().build());
    });

    it('should throw an error when saving a product with missing required fields', async () => {
        await expect(
            productModel.save({
                id: "123",
                // Missing "name" and "price" fields
                quantity: 10,
            } as any) // Cast to "any" to bypass TypeScript checks for testing
        ).rejects.toThrow("Missing required field: name");
    });

    it('should throw an error when saving a product with invalid field types', async () => {
        await expect(
            productModel.save({
                id: "123",
                name: "Laptop",
                price: "invalid", // Invalid type for "price"
                quantity: 10,
            } as any) // Cast to "any" to bypass TypeScript checks for testing
        ).rejects.toThrow("Document validation failed");
    });

})
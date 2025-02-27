import { cleanup, connect } from './db';
import { Database, FieldBuilder, Model } from '../src';
import dotenv from 'dotenv';
import { ObjectId } from '../src/types';
dotenv.config();

interface Product {
    id: string;
    sku: string;
    name: string;
}

describe('Indexes Tests', () => {
    let db: Database;
    let productModel: Model<Product>;

    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        productModel = new Model<Product>(db, "products3")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("sku", new FieldBuilder<string>("sku").type(String).unique().build())
            .addField("name", new FieldBuilder<string>("name").type(String).index().build());
    }, 10000);

    it('should enforce unique constraint on the sku field', async () => {
        await productModel.save({
            id: "123",
            sku: "SKU123",
            name: "Product 1",
        });

        await expect(
            productModel.save({
                id: "456",
                sku: "SKU123", // Duplicate SKU
                name: "Product 2",
            })
        ).rejects.toThrow("duplicate key error");
    });

    it('should create an index on the name field', async () => {
        const indexes = await productModel.getCollection().indexInformation();
        // expect(indexes).toContainEqual(expect.objectContaining({ name: 1 }));
        expect(indexes).toHaveProperty("name_1", [["name", 1]]);
    });
})

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

        productModel = new Model<Product>(db, "products")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("sku", new FieldBuilder<string>("sku").type(String).unique().build())
            .addField("name", new FieldBuilder<string>("name").type(String).index().build());
    }, 10000);
})

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

})
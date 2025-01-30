import dotenv from 'dotenv';
import { Database, FieldBuilder, HookType, Model } from '../src';
import {connect} from './db'


dotenv.config();

interface Order {
    id: string;
    total: number;
    status: string;
}

describe('Hooks Tests', () => {
    let db: Database;
    let orderModel: Model<Order>;

    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        orderModel = new Model<Order>(db, "orders")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("total", new FieldBuilder<number>("total").type(Number).required().build())
            .addField("status", new FieldBuilder<string>("status").type(String).default("pending").build());

        // Add a pre-save hook to validate the order total
        orderModel.addHook(HookType.PreSave, {
            execute: async (document: Order) => {
                if (document.total <= 0) {
                    throw new Error("Order total must be greater than 0");
                }
            }
        });

        // Add a post-save hook to update the order status
        orderModel.addHook(HookType.PostSave, {
            execute: async (document: Order) => {
                document.status = "completed";
            }
        });
    });
})
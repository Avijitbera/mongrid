import dotenv from 'dotenv';
import { Database, FieldBuilder, HookType, Model } from '../src';
import {connect} from './db'
import { ObjectId } from '../src/types';


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
            execute: async (document: Order & { _id: string }) => {
                document.status = "completed";
                await orderModel.updateById(new ObjectId(document._id), { status: "completed" });
            }
        });
    });

    afterAll(async () => {
        // await cleanup();
    });

    it('should execute pre-save hook and throw an error for invalid order total', async () => {
        await expect(
            orderModel.save({
                id: "123",
                total: -10, // Invalid total
                status: "pending",
            })
        ).rejects.toThrow("Order total must be greater than 0");
    });

    it('should execute post-save hook and update the order status', async () => {
        const orderId = await orderModel.save({
            id: "456",
            total: 100,
            status: "pending",
        });

        const order = await orderModel.findById(new ObjectId(orderId));
        expect(order).toBeDefined();
        expect(order?.status).toBe("completed");
    });
})
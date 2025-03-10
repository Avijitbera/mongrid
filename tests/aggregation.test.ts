
import { FieldBuilder, Model } from '../src';
import { Database } from '../src/core/Database';
import { QueryBuilder } from '../src/core/QueryBuilder';
import {User} from './model/user.model'
import { connect } from './db';

interface OrderRevenueByProduct {
    _id: string; // The product name
    totalRevenue: number; // The total revenue for the product
}
interface Order {
    id: string;
    product: string;
    quantity: number;
    price: number;
}

describe("AggregationBuilder Tests", () =>{
    let db: Database;
    let orderModel: Model<Order>;


    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        orderModel = new Model<Order>(db, "orders")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("product", new FieldBuilder<string>("product").type(String).required().build())
            .addField("quantity", new FieldBuilder<number>("quantity").type(Number).required().build())
            .addField("price", new FieldBuilder<number>("price").type(Number).required().build());

        // Insert test data
        await orderModel.save({ id: "1", product: "Laptop", quantity: 2, price: 1000 });
        await orderModel.save({ id: "2", product: "Phone", quantity: 3, price: 500 });
        await orderModel.save({ id: "3", product: "Tablet", quantity: 1, price: 300 });
    });

    afterAll(async () => {
        await orderModel.delete({}); // Clean up the collection after tests
    });

    it('should aggregate orders by product and calculate total revenue', async () => {
        const results = (await orderModel
            .aggregate()
            .group({
                _id: "$product",
                totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } },
            })
            .sort({ totalRevenue: -1 })
            .execute()) as unknown as OrderRevenueByProduct[];

        expect(results).toHaveLength(3);
        expect(results[0]._id).toBe("Laptop");
        expect(results[0].totalRevenue).toBe(2000); // 2 * 1000
        expect(results[1]._id).toBe("Phone");
        expect(results[1].totalRevenue).toBe(1500); // 3 * 500
        expect(results[2]._id).toBe("Tablet");
        expect(results[2].totalRevenue).toBe(300); // 1 * 300
    });

    it('should throw an error for an empty aggregation pipeline', async () => {
        const aggregationBuilder = orderModel.aggregate();
        await expect(aggregationBuilder.execute()).rejects.toThrow("Aggregation pipeline is empty");
    });
})

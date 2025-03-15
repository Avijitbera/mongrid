
import { FieldBuilder, Model } from '../src';
import { Database } from '../src/core/Database';
import { QueryBuilder } from '../src/core/QueryBuilder';
import {User} from './model/user.model'
import { connect } from './db';

interface OrderWithTotal extends Order {
    total: number; // Added field for the total
}

interface OrderRevenueByProduct {
    _id: string; // The product name
    totalRevenue: number; // The total revenue for the product
}

interface OrderWithCustomer extends Order {
    customer: { id: string; name: string }[]; // Added field for the joined customer data
}

interface OrderCountResult {
    totalOrders: number; // Added field for the count result
}

interface Order {
    id: string;
    product: string;
    quantity: number | number[];
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

    it('should filter orders using $match stage', async () => {
        const results = await orderModel
            .aggregate()
            .match({ product: "Laptop" }) // Filter orders for Laptop
            .execute();

        expect(results).toHaveLength(1);
        expect(results[0].product).toBe("Laptop");
    });

    it('should sort orders by price in ascending order', async () => {
        const results = await orderModel
            .aggregate()
            .sort({ price: 1 }) // Sort by price in ascending order
            .execute();

        expect(results).toHaveLength(3);
        expect(results[0].product).toBe("Tablet"); // Lowest price
        expect(results[1].product).toBe("Phone"); // Middle price
        expect(results[2].product).toBe("Laptop"); // Highest price
    });

    it('should limit the number of documents returned', async () => {
        const results = await orderModel
            .aggregate()
            .limit(2) // Limit to 2 documents
            .execute();

        expect(results).toHaveLength(2);
    });

    it('should skip the first document', async () => {
        const results = await orderModel
            .aggregate()
            .skip(1) // Skip the first document
            .execute();

        expect(results).toHaveLength(2);
    });

    it('should project specific fields', async () => {
        const results = await orderModel
            .aggregate()
            .project({ product: 1, price: 1 }) // Include only product and price fields
            .execute();

        expect(results).toHaveLength(3);
        expect(results[0].product).toBeDefined();
        expect(results[0].price).toBeDefined();
        expect(results[0].quantity).toBeUndefined(); // Quantity should not be included
    });

    it('should add a new field using $addFields', async () => {
        const results = await orderModel
            .aggregate()
            .addFields({ total: { $multiply: ["$quantity", "$price"] } }) // Add a total field
            .execute()  as OrderWithTotal[];

        expect(results).toHaveLength(3);
        expect(results[0].total).toBe(2000); // Laptop: 2 * 1000
        expect(results[1].total).toBe(1500); // Phone: 3 * 500
        expect(results[2].total).toBe(300); // Tablet: 1 * 300
    });


    it('should unwind an array field', async () => {
        // Insert a test document with an array field
        await orderModel.save({ id: "4", product: "Accessories", quantity: [1, 2], price: 50 });

        const results = await orderModel
            .aggregate()
            .unwind("$quantity") // Unwind the quantity array
            .execute();

        expect(results).toHaveLength(5); // Original 3 + 2 unwound documents
    });

    it('should count the number of documents', async () => {
        const results = (await orderModel
            .aggregate()
            .count("totalOrders") // Count the number of documents
            .execute()) as unknown as OrderCountResult[]; // Cast the result to OrderCountResult

        expect(results).toHaveLength(1);
        expect(results[0].totalOrders).toBe(3);  // 3 orders in the collection
    });


    it('should perform a $lookup to join data from another collection', async () => {
        // Create a related collection for testing
        const customerModel = new Model<{ id: string; name: string }>(db, "customers")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("name", new FieldBuilder<string>("name").type(String).required().build());

        await customerModel.save({ id: "1", name: "John Doe" });

        const results = await orderModel
            .aggregate()
            .lookup({
                from: "customers",
                localField: "id",
                foreignField: "id",
                as: "customer",
            })
            .execute() as OrderWithCustomer[];

        expect(results).toHaveLength(3);
        expect(results[0].customer).toBeDefined();
    });

    it('should replace the root document', async () => {
        const results = await orderModel
            .aggregate()
            .replaceRoot("$product") // Replace root with the product field
            .execute();

        expect(results).toHaveLength(3);
        expect(results[0]).toBe("Laptop");
        expect(results[1]).toBe("Phone");
        expect(results[2]).toBe("Tablet");
    });

    it('should merge results into another collection', async () => {
        const results = await orderModel
            .aggregate()
            .merge({ into: "order_summaries" }) // Merge results into a new collection
            .execute();

        // Verify that the results were merged into the new collection
        const summaries = await db.getCollection("order_summaries").find().toArray();
        expect(summaries).toHaveLength(3);
    });
})

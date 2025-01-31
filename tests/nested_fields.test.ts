import { cleanup, connect } from './db';
import { Database, FieldBuilder, Model, NestedField } from '../src';
import dotenv from 'dotenv';
import { ObjectId } from '../src/types';
dotenv.config();

interface Address {
    street: string;
    city: string;
    zip: string;
}

interface Customer {
    id: string;
    name: string;
    address: Address;
}

describe('Nested Fields Tests', () =>{
    let db: Database;
    let customerModel: Model<Customer>;
    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        const addressField = new NestedField<Address>("address")
            .addField("street", new FieldBuilder<string>("street").type(String).required().build())
            .addField("city", new FieldBuilder<string>("city").type(String).required().build())
            .addField("zip", new FieldBuilder<string>("zip").type(String).required().build());

        customerModel = new Model<Customer>(db, "customers")
            .addField("id", new FieldBuilder<string>("id").type(String).required().build())
            .addField("name", new FieldBuilder<string>("name").type(String).required().build())
            .addField("address", addressField);
    }, 10000);

    it('should save and retrieve a customer with nested address', async () => {
        const customerId = await customerModel.save({
            id: "123",
            name: "John Doe",
            address: {
                street: "123 Main St",
                city: "New York",
                zip: "10001",
            },
        });

        const customer = await customerModel.findById(new ObjectId(customerId));
        expect(customer).toBeDefined();
        expect(customer?.name).toBe("John Doe");
        expect(customer?.address.street).toBe("123 Main St");
        expect(customer?.address.city).toBe("New York");
        expect(customer?.address.zip).toBe("10001");
    });
})
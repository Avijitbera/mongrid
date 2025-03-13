import {Database, Model, ObjectId} from '../src'
import { FileField } from '../src/core/fields/FileField';

interface Product {
    id: string;
    name: string;
    image: ObjectId; // Stores the file ID for the product image
}

describe('File Handling Tests', () => {
    let db: Database;
    let productModel: Model<Product>;
    let fileField: FileField<Product>;
})
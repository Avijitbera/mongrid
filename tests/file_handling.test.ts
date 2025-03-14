import {Database, FieldBuilder, Model, ObjectId} from '../src'
import { FileField, File } from '../src/core/fields/FileField';
import {connect} from './db'


interface Product {
    id: string;
    name: string;
    image: File; // Stores the file ID for the product image
}

describe('File Handling Tests', () => {
    let db: Database;
    let productModel: Model<Product>;
    let fileField: FileField<Product>;

    beforeAll(async () => {
        const mongodb = await connect();
        db = new Database(mongodb);

        fileField = new FileField<Product>('image')
            .maxSize(5 * 1024 * 1024) // 5MB max file size
            .allowedTypes(['image/jpeg', 'image/png']) // Only allow JPEG and PNG
            .autoDeleteOnRemove(true) // Automatically delete the file when the product is deleted
            .enableMetadataCaching(true); // Cache file metadata


        // Define the Product model with a FileField for the image
        productModel = new Model<Product>(db, 'products')
            .addField('id', new FieldBuilder<string>('id').type(String).required().build())
            .addField('name', new FieldBuilder<string>('name').type(String).required().build())
            .addField('image', fileField);
    })

    afterAll(async () => {
         // Clean up the database after tests
         productModel.delete();
    });


    it('should upload a file and save the file ID in the document', async ()=>{
        const mockFile: File = {
            originalname: 'test-image.jpg',
            buffer: Buffer.from('mock file content'),
            mimetype: 'image/jpeg',
            size: 1024, // 1KB
        };

        // Save the product with the uploaded file
        const productId = await productModel.save({
            id: '123',
            name: 'Test Product',
            image: mockFile, // Pass the file to the FileField
        });

        const product = await productModel.findById(new ObjectId(productId));
    expect(product).toBeDefined();
    expect(product?.name).toBe('Test Product');
    expect(product?.image.fileId).toBeInstanceOf(ObjectId); // Ensure the file ID is stored

    // Retrieve the file metadata
    const fileMetadata = await fileField.getFileMetadata(product!.image.fileId!, productModel);
    expect(fileMetadata).toBeDefined();
    expect(fileMetadata.filename).toBe('test-image.jpg');
    expect(fileMetadata.mimeType).toBe('image/jpeg');
    expect(fileMetadata.size).toBe(1024);
    })

    it('should throw an error when uploading a file with an invalid MIME type', async () => {
        // Create a mock file with an invalid MIME type
        const mockFile: File = {
            originalname: 'test-file.pdf',
            buffer: Buffer.from('mock file content'),
            mimetype: 'application/pdf', // Invalid MIME type
            size: 1024,
        };

        // Attempt to save the product with the invalid file
        await expect(
            productModel.save({
                id: '456',
                name: 'Invalid Product',
                image: mockFile,
            })
        ).rejects.toThrow('File type \'application/pdf\' is not allowed');
    });

    it('should throw an error when uploading a file that exceeds the maximum size', async () => {
        // Create a mock file that exceeds the maximum size
        const mockFile: File = {
            originalname: 'large-image.jpg',
            buffer: Buffer.alloc(6 * 1024 * 1024), // 6MB (exceeds the 5MB limit)
            mimetype: 'image/jpeg',
            size: 6 * 1024 * 1024,
        };

        // Attempt to save the product with the oversized file
        await expect(
            productModel.save({
                id: '999',
                name: 'Oversized Product',
                image: mockFile,
            })
        ).rejects.toThrow('File size exceeds the maximum allowed size');
    });

})
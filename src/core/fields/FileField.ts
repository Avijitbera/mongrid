import { Document, GridFSBucket, ObjectId } from "mongodb";
import { Field } from "./Field";
import { ERROR_CODES, MongridError } from "../../error/MongridError";
import { Model } from "../model";

export interface File {
    originalname: string; // Original file name
    buffer: Buffer; // File content as a Buffer
    mimetype: string; // MIME type of the file
    size: number; // File size in bytes
    id?: ObjectId; // Optional field to store the file ID (ObjectId) after upload
    metadata?: any; // Optional field to store file metadata
}

export class FileField<T extends Document> extends Field<T>  {
    private bucketName: string = 'files';
    private maxFileSize: number = 16 * 1024 * 1024;

    private allowedMimeTypes: string[] = []; // Allowed MIME types (e.g., ['image/jpeg', 'application/pdf'])
    private autoDelete: boolean = true; // Automatically delete file when document is deleted
    private generateUrl: boolean = false; // Whether to generate a URL for the file
    private cacheMetadata: boolean = false; // Whether to cache file metadata
    private cachedMetadata: Map<ObjectId, any> = new Map();

    constructor(name: string) {
        super(name);
    }
    /**
     * Sets the GridFS bucket name for file storage.
     * @param bucketName The name of the GridFS bucket.
     * @returns The FileField instance for chaining.
     */
    bucket(bucketName: string): this {
        this.bucketName = bucketName;
        return this;
    }

    /**
     * Sets the maximum allowed file size in bytes.
     * @param maxFileSize The maximum file size in bytes.
     * @returns The FileField instance for chaining.
     */
    maxSize(maxFileSize: number): this {
        this.maxFileSize = maxFileSize;
        return this;
    }

     /**
     * Sets the allowed MIME types for the file.
     * @param mimeTypes An array of allowed MIME types (e.g., ['image/jpeg', 'application/pdf']).
     * @returns The FileField instance for chaining.
     */
     allowedTypes(mimeTypes: string[]): this {
        this.allowedMimeTypes = mimeTypes;
        return this;
    }
    /**
     * Enables or disables automatic file deletion when the document is deleted.
     * @param autoDelete Whether to automatically delete the file.
     * @returns The FileField instance for chaining.
     */
    autoDeleteOnRemove(autoDelete: boolean): this {
        this.autoDelete = autoDelete;
        return this;
    }

    /**
     * Enables or disables URL generation for the file.
     * @param generateUrl Whether to generate a URL for the file.
     * @returns The FileField instance for chaining.
     */
    enableUrlGeneration(generateUrl: boolean): this {
        this.generateUrl = generateUrl;
        return this;
    }

    /**
     * Enables or disables caching of file metadata.
     * @param cacheMetadata Whether to cache file metadata.
     * @returns The FileField instance for chaining.
     */
    enableMetadataCaching(cacheMetadata: boolean): this {
        this.cacheMetadata = cacheMetadata;
        return this;
    }

     /**
     * Uploads a file to GridFS and returns the file ID and metadata.
     * @param file The file to upload.
     * @param model The model instance.
     * @returns A promise that resolves to the file ID and metadata.
     * @throws {MongridError} If the file upload fails.
     */
     async uploadFile(file: File, model: Model<T>): Promise<File> {
        const db = model.getDb();
        const bucket = new GridFSBucket(db, { bucketName: this.bucketName });

        // Validate file size
        if (file.size > this.maxFileSize) {
            throw new Error(`File size exceeds the maximum allowed size of ${this.maxFileSize} bytes`);
        }

        // Validate MIME type
        if (this.allowedMimeTypes.length > 0 && !this.allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(`File type '${file.mimetype}' is not allowed`);
        }
        

        // Upload file to GridFS
        return new Promise((resolve, reject) => {
            
            const uploadStream = bucket.openUploadStream(file.originalname, {
                metadata: {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                },
            });

            uploadStream.write(file.buffer);
            uploadStream.end(() => {
                const fileId = uploadStream.id;
                const metadata = {
                    id: fileId,
                    filename: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype,
                    uploadDate: new Date(),
                };

                // Cache metadata if enabled
                if (this.cacheMetadata) {
                    this.cachedMetadata.set(fileId, metadata);
                }

                resolve({
                    ...file,
                    id: fileId,
                    metadata,
                });
            });

            uploadStream.on('error', (error) => {
                console.log({error})
                reject(new Error(`File upload failed: ${error.message}`));
            });
        });
    }
    // async uploadFile(file: File, model: Model<T>): Promise<File> {
    //     const db = model.getDb();
    //     const bucket = new GridFSBucket(db, { bucketName: this.bucketName });
    //     console.log({bucket})

    //     // Validate file size
    //     if (file.size > this.maxFileSize) {
    //         throw new Error(`File size exceeds the maximum allowed size of ${this.maxFileSize} bytes`);
    //     }

    //     // Validate MIME type
    //     if (this.allowedMimeTypes.length > 0 && !this.allowedMimeTypes.includes(file.mimetype)) {
    //         throw new Error(`File type '${file.mimetype}' is not allowed`);
    //     }

    //     // Upload file to GridFS
    //     return new Promise((resolve, reject) => {
    //         const uploadStream = bucket.openUploadStream(file.originalname, {
    //             metadata: {
    //                 originalName: file.originalname,
    //                 mimeType: file.mimetype,
    //                 size: file.size,
    //             },
    //         });
    
    //         uploadStream.write(file.buffer);
    //         uploadStream.end(() => {
    //             const fileId = uploadStream.id;
    //             const metadata = {
    //                 id: fileId,
    //                 filename: file.originalname,
    //                 size: file.size,
    //                 mimeType: file.mimetype,
    //                 uploadDate: new Date(),
    //             };
    
    //             // Cache metadata if enabled
    //             if (this.cacheMetadata) {
    //                 this.cachedMetadata.set(fileId, metadata);
    //             }
    
    //             resolve({
    //                 ...file,
    //                 id: fileId,
    //                 metadata,
    //             });
    //         });
    
    //         uploadStream.on('error', (error) => {
    //             reject(new Error(`File upload failed: ${error.message}`));
    //         });
    //     });
    // }


    /**
     * Deletes a file from GridFS by its ID.
     * @param fileId The ID of the file to delete.
     * @param model The model instance.
     * @returns A promise that resolves when the file is deleted.
     * @throws {MongridError} If the file deletion fails.
     */
    async deleteFile(fileId: ObjectId, model: Model<T>): Promise<void> {
        const db = model.getDb();
    const bucket = new GridFSBucket(db, { bucketName: this.bucketName });

    console.log(`Attempting to delete file with ID: ${fileId.toString()}`); // Log the file ID

    // Verify that the file exists before attempting to delete it
    const files = await bucket.find({ _id: fileId }).toArray();
    console.log(`Files found: ${JSON.stringify(files)}`); // Log the files found

    if (files.length === 0) {
        console.log(`File not found for ID: ${fileId.toString()}`); // Log if the file is not found
        throw new MongridError(
            `File not found for ID: ${fileId.toString()}`, // Convert fileId to string
            ERROR_CODES.FILE_NOT_FOUND,
            { fileId }
        );
    }
    
        // Delete the file
        return new Promise(async (resolve, reject) => {
            try {
                await bucket.delete(fileId);
                console.log(`File deleted successfully: ${fileId.toString()}`); // Log the file ID
    
                // Remove metadata from cache if enabled
                if (this.cacheMetadata) {
                    this.cachedMetadata.delete(fileId);
                }
                resolve();
            } catch (error: any) {
                console.error(`File deletion failed: ${error.message}`); // Log the error
                reject(
                    new MongridError(
                        `File deletion failed: ${error.message}`,
                        ERROR_CODES.FILE_DELETION_ERROR,
                        { fileId }
                    )
                );
            }
        });
    }

/**
     * Fetches file metadata from GridFS.
     * @param fileId The ID of the file.
     * @param model The model instance.
     * @returns A promise that resolves to the file metadata.
     */
async getFileMetadata(fileId: ObjectId, model: Model<T>): Promise<any> {
    console.log({fileId})
    // Return cached metadata if available
    // if (this.cacheMetadata && this.cachedMetadata.has(fileId)) {
    //     return this.cachedMetadata.get(fileId);
    // }

    const db = model.getDb();
    const bucket = new GridFSBucket(db, { bucketName: this.bucketName });

    const files = await bucket.find({ _id: fileId,  }).toArray();
    console.log({files})
    if (files.length === 0) {
        throw new MongridError(
            `File not found`,
            ERROR_CODES.FILE_NOT_FOUND,
            { fileId }
        );
    }

    const file = files[0];
    const metadata = {
        id: file._id,
        filename: file.filename,
        size: file.length,
        mimeType: file.metadata?.mimeType,
        uploadDate: file.uploadDate,
    };

    // Cache metadata if enabled
    if (this.cacheMetadata) {
        this.cachedMetadata.set(fileId, metadata);
    }

    return metadata;
}

     /**
     * Generates a URL to access the file.
     * @param fileId The ID of the file.
     * @param model The model instance.
     * @returns A URL to access the file.
     */
     getFileUrl(fileId: ObjectId, model: Model<T>): string {
        return `/files/${fileId}`; // Example URL
    }

    /**
     * Streams a file from GridFS.
     * @param fileId The ID of the file.
     * @param model The model instance.
     * @returns A readable stream for the file.
     */
    streamFile(fileId: ObjectId, model: Model<T>): any {
        const db = model.getDb();
        const bucket = new GridFSBucket(db, { bucketName: this.bucketName });
        return bucket.openDownloadStream(fileId);
    }
}

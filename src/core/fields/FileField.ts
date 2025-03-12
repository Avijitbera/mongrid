import { Document, GridFSBucket, ObjectId } from "mongodb";
import { Field } from "./Field";
import { ERROR_CODES, MongridError } from "../../error/MongridError";
import { Model } from "../model";

interface File {
    originalname: string; // Original file name
    buffer: Buffer; // File content as a Buffer
    mimetype: string; // MIME type of the file
    size: number; // File size in bytes
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
    async uploadFile(file: File, model: Model<T>): Promise<{ id: ObjectId; metadata: any }> {
        const db = model.getDb(); // Access the Db instance from the model
        const bucket = new GridFSBucket(db, { bucketName: this.bucketName });

        // Validate file size
        if (file.size > this.maxFileSize) {
            throw new MongridError(
                `File size exceeds the maximum allowed size of ${this.maxFileSize} bytes`,
                ERROR_CODES.FILE_SIZE_EXCEEDED,
                { fileSize: file.size, maxFileSize: this.maxFileSize }
            );
        }

        // Validate MIME type
        if (this.allowedMimeTypes.length > 0 && !this.allowedMimeTypes.includes(file.mimetype)) {
            throw new MongridError(
                `File type '${file.mimetype}' is not allowed`,
                ERROR_CODES.FILE_TYPE_NOT_ALLOWED,
                { allowedMimeTypes: this.allowedMimeTypes }
            );
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

                resolve({ id: fileId, metadata });
            });

            uploadStream.on("error", (error:any) => {
                reject(
                    new MongridError(
                        `File upload failed: ${error.message}`,
                        ERROR_CODES.FILE_UPLOAD_ERROR,
                        { error }
                    )
                );
            });
        });
    }

    
}

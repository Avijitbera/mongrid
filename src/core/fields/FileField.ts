import { ObjectId } from "mongodb";
import { Field } from "./Field";

interface File {
    originalname: string; // Original file name
    buffer: Buffer; // File content as a Buffer
    mimetype: string; // MIME type of the file
    size: number; // File size in bytes
}

export class FileField<T> extends Field<T> {
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

    
}

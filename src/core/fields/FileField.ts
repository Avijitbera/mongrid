import { ObjectId } from "mongodb";
import { Field } from "./Field";

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
}

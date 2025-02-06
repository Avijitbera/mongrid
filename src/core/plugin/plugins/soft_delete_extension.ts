import { Document, ObjectId } from "mongodb";


declare module "../../model" {
    interface Model<T extends Document> {
        /**
         * Soft deletes a document by setting the `deletedAt` field.
         * @param id The ID of the document to soft delete.
         */
        softDelete(id: ObjectId): Promise<void>;

        /**
         * Restores a soft-deleted document by setting the `deletedAt` field to `null`.
         * @param id The ID of the document to restore.
         */
        restore(id: ObjectId): Promise<void>;
    }
}
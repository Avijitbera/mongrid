import { Filter } from "mongodb";
import { ModelQueryOptions, ModelDocument } from "../../types/model";
import { SchemaType } from "../../types/types";
import { BaseOperations } from "./base_operations";
import { convertFilterIds } from "../../utils/id";
import { DeleteError } from "../../errors/delete_error";


export class DeleteOperations<T extends SchemaType> extends BaseOperations<T> {
    
    /**
     * Delete a single document from the collection.
     * 
     * @param filter The filter to apply to the query.
     * @param options Additional query options.
     * @returns A promise that resolves to true if a document was deleted, false otherwise.
     * @throws {DeleteError} If the query fails.
     */
    async deleteOne(
        filter: Filter<ModelDocument<T>>,
        options?: ModelQueryOptions
    ):Promise<boolean>{
        return this.executeQuery('deleteOne', async() =>{
            const query = this.queryBuilder.buildQuery(convertFilterIds(filter))
            
            if(this.options.softDelete){
                const result = await this.collection.findOneAndUpdate(
                    query,
                    { 
                      $set: { 
                        deletedAt: new Date(),
                        ...(this.options.timestamps && { updatedAt: new Date() })
                      }
                    }
                  );
                  return !!result?.value;
            }

            const result = await this.collection.deleteOne(query);
            return result.deletedCount === 1;
    
        },options, filter);
    }

    /**
     * Restore a single document by setting its deletedAt field to null.
     * 
     * @param filter The filter to apply to the query.
     * @param options Additional query options.
     * @returns A promise that resolves to true if a document was restored, false otherwise.
     * @throws {Error} If the softDelete option is not enabled.
     */
    async restore(
        filter: Filter<ModelDocument<T>>,
        options?: ModelQueryOptions
    ): Promise<boolean> {
        if (!this.options.softDelete) {
            throw new Error('Restore operation is only available with softDelete option enabled');
        }
        return this.executeQuery('restore', async () => {
            const query = this.queryBuilder.buildQuery(convertFilterIds(filter));
            const result = await this.collection.findOneAndUpdate(
              query,
              { 
                $unset: { deletedAt: "" },
                ...(this.options.timestamps && { 
                  $set: { updatedAt: new Date() }
                })
              }
            );
            return !!result?.value;
          }, options, filter);

    }
    
    /**
     * Execute a delete operation.
     *
     * This method is abstract and must be implemented by any child class.
     *
     * @param operation - The name of the operation, used for error reporting.
     * @param callback - A callback that performs the actual query.
     * @param options - Query options, such as sorting, filtering, and limiting.
     * @param filter - Additional filter to apply to the query.
     * @returns A promise that resolves to the result of the query.
     * @throws {DeleteError} If the query fails.
     */
    protected async executeQuery<R>(operation: string,
         callback: () => Promise<R>,
          options?: ModelQueryOptions, 
          filter?: Filter<ModelDocument<T>> | undefined):
           Promise<R> {
        try {
            return await callback()
        } catch (error) {
            throw new DeleteError(operation, filter, options, error)
        }
    }
    
}
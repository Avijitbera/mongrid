import { Filter } from "mongodb";
import { ModelQueryOptions, ModelDocument } from "../../types/model";
import { SchemaType } from "../../types/types";
import { BaseOperations } from "./base_operations";
import { convertFilterIds } from "../../utils/id";
import { DeleteError } from "../../errors/delete_error";


export class DeleteOperations<T extends SchemaType> extends BaseOperations<T> {
    
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
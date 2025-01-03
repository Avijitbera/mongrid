import { Filter } from "mongodb";
import { ModelQueryOptions, ModelDocument } from "../../types/model";
import { SchemaType } from "../../types/types";
import { BaseOperations } from "./base_operations";
import { convertFilterIds } from "../../utils/id";


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
    
    protected executeQuery<R>(operation: string, callback: () => Promise<R>, options?: ModelQueryOptions, filter?: Filter<ModelDocument<T>> | undefined): Promise<R> {
        throw new Error("Method not implemented.");
    }
    
}
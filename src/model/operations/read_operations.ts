import { Filter } from "mongodb";
import { ModelQueryOptions, ModelDocument } from "../../types/model";
import { SchemaType } from "../../types/types";
import { BaseOperations } from "./base_operations";
import { convertFilterIds } from "../../utils/id";


export class ReadOperations<T extends SchemaType> extends BaseOperations<T> {
    async findOne(
        filter: Filter<ModelDocument<T>>,
        options?: ModelQueryOptions
    ): Promise<ModelDocument<T> | null> {
        return this.executeQuery("findOne", async() =>{
            const query = this.queryBuilder.buildQuery(convertFilterIds(filter))
            const queryOptions = this.buildQueryOptions(options);
        })
    }
    
    protected executeQuery<R>(operation: string,
         callback: () => Promise<R>,
         options?: ModelQueryOptions,
         filter?: Filter<ModelDocument<T>> | undefined): Promise<R> {
        throw new Error("Method not implemented.");
    }
    
}
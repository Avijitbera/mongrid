import { Filter, WithId } from "mongodb";
import { ModelQueryOptions, ModelDocument } from "../../types/model";
import { SchemaType } from "../../types/types";
import { BaseOperations } from "./base_operations";
import { convertFilterIds } from "../../utils/id";
import { QueryError } from "../../errors/query_error";


export class ReadOperations<T extends SchemaType> extends BaseOperations<T> {
    async findOne(
        filter: Filter<ModelDocument<T>>,
        options?: ModelQueryOptions
    ): Promise<ModelDocument<T> | null> {
        return this.executeQuery("findOne", async() =>{
            const query = this.queryBuilder.buildQuery(convertFilterIds(filter))
            const queryOptions = this.buildQueryOptions(options);

            const doc = await this.collection.findOne<WithId<ModelDocument<T>>>(query, queryOptions);
            if (!doc) return null;
            const result = await this.hooks.executePostHooks('findOne', doc as ModelDocument<T>);
            return this.handlePopulation(result, options);
        }, options, filter)
    }
    
    protected async executeQuery<R>(operation: string,
         callback: () => Promise<R>,
         options?: ModelQueryOptions,
         filter?: Filter<ModelDocument<T>> | undefined): Promise<R> {
        try {
            return await callback()
        } catch (error) {
            throw new QueryError(operation, filter, options, error)
        }
    }
    
}
import { Filter, WithId } from "mongodb";
import { ModelQueryOptions, ModelDocument } from "../../types/model";
import { SchemaType } from "../../types/types";
import { BaseOperations } from "./base_operations";
import { convertFilterIds } from "../../utils/id";
import { QueryError } from "../../errors/query_error";


export class ReadOperations<T extends SchemaType> extends BaseOperations<T> {
    /**
     * Find a single document matching the given filter.
     *
     * @param filter The filter to apply to the query.
     * @param options Additional query options.
     * @returns The found document, or null if no document was found.
     * @throws {QueryError} If the query fails.
     */
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

    async find(
        filter: Filter<ModelDocument<T>>,
        options?: ModelQueryOptions
      ): Promise<ModelDocument<T>[]> {
        return this.executeQuery('find', async () => {
          const query = this.queryBuilder.buildQuery(convertFilterIds(filter));
          const queryOptions = this.buildQueryOptions(options);
    
          const docs = await this.collection.find<WithId<ModelDocument<T>>>(query, queryOptions).toArray();
          const results = await this.hooks.executePostHooks('find', docs);
          return this.handlePopulation(results, options);
        }, options, filter);
      }
    
}
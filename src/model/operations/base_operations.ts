import { Filter } from "mongodb";
import { ModelDocument, ModelQueryOptions } from "../../types/model";
import { SchemaType } from "../../types/types";
import { BaseModel } from "../base";





export abstract class BaseOperations<T extends SchemaType> extends BaseModel<T> {
    /**
     * Execute a query operation.
     *
     * This method is abstract and must be implemented by any child class.
     *
     * @param operation - The name of the operation, used for error reporting.
     * @param callback - A callback that performs the actual query.
     * @param options - Query options, such as sorting, filtering, and limiting.
     * @param filter - Additional filter to apply to the query.
     * @returns A promise that resolves to the result of the query.
     */
    protected abstract executeQuery<R>(
        operation: string,
        callback:()=> Promise<R>,
        options?: ModelQueryOptions,
        filter?: Filter<ModelDocument<T>>
    ): Promise<R>;

   

      

      protected buildQueryOptions(options?: ModelQueryOptions): ModelQueryOptions {
        const { populate, lean, ...mongoOptions } = options || {};
        return {
          ...this.queryBuilder.buildOptions(mongoOptions),
          populate,
          lean
        };
      }

      protected async handlePopulation<R extends ModelDocument<T> | ModelDocument<T>[] | null>(
        result: R,
        options?: ModelQueryOptions
      ): Promise<R> {
        if (!result || !options?.populate) return result;
        
        if (Array.isArray(result)) {
          return Promise.all(
            result.map(doc => this.relationManager.populate(doc, options.populate!))
          ) as Promise<R>;
        }
        
        return this.relationManager.populate(result, options.populate) as Promise<R>;
      }
}
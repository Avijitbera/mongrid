import { Filter } from "mongodb";
import { ModelDocument, ModelQueryOptions } from "../../types/model";
import { SchemaType } from "../../types/types";
import { BaseModel } from "../base";





export abstract class BaseOperations<T extends SchemaType> extends BaseModel<T> {
    protected abstract executeQuery<R>(
        operation: string,
        callback:()=> Promise<R>,
        options?: ModelQueryOptions,
        filter?: Filter<ModelDocument<T>>
    ): Promise<R>;

    protected async handlePopulation<R extends ModelDocument<T> | ModelDocument<T>[] | null>(
        result: R,
        options?: ModelQueryOptions
      ): Promise<R> {
        if (!result || !options?.populate) return result;
        
        if (Array.isArray(result)) {
          return Promise.all(
            result.map(doc => this.relationManager.populate(doc, options.populate))
          ) as Promise<R>;
        }
        
        return this.relationManager.populate(result, options.populate) as Promise<R>;
      }
}
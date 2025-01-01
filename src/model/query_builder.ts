import {ModelOptions, SchemaType} from '../types/types'
import {ModelDocument, ModelQueryOptions} from '../types/model'
import { BaseModel } from './base'
import { Filter } from 'mongodb'

export class QueryBuilder<T extends SchemaType> {
    constructor(private modelOptions: ModelOptions){}

    buildQuery(filter: Filter<ModelDocument<T>> = {}): Filter<ModelDocument<T>> {
        return {
          ...filter,
          ...this.buildSoftDeleteQuery(),
        };
      }

    buildOptions(options: ModelQueryOptions = {}): ModelQueryOptions {
        return {
            ...this.buildDefaultOption(),
            ...options
        }
    }

    private buildSoftDeleteQuery(): Filter<ModelDocument<T>> {
        if(this.modelOptions.softDelete){
            return { deletedAt: { $exists:false } }
        }
        return {}
    }

    private buildDefaultOption():ModelQueryOptions {
        const defaultOptions = this.modelOptions.defaultOptions || {};
        return {
            sort: { createdAt: -1, ...defaultOptions.sort },
            limit: defaultOptions.limit,
            skip: defaultOptions.skip
        }
    }
} 



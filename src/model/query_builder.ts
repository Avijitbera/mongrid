import {SchemaType} from '../types/types'
import {ModelDocument, ModelQueryOptions} from '../types/model'
import { BaseModel } from './base'
import { Filter } from 'mongodb'

export class QueryBuilder<T extends SchemaType> {
    constructor(private model: BaseModel<T>){}

    buildQuery(filter: Filter<ModelDocument<T>> = {}):Filter<ModelDocument<T>> {
        return {
            ...filter,
        }
    }
} 



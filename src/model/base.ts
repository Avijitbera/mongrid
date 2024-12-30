import {Collection} from 'mongodb'
import {Schema} from '../schema'
import {QueryBuilder} from './query_builder'
import { ModelOptions, SchemaType } from '../types/types';
import { ModelHooks } from './hooks';

export class BaseModel<T extends SchemaType> {
    protected collection: Collection;
    protected queryBuilder: QueryBuilder<T>;
    protected hooks: ModelHooks<T>;
    

    constructor(
        public options: ModelOptions = {},

    ){}
}

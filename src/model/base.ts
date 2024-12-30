import {Collection} from 'mongodb'
import {Schema} from '../schema'
import {QueryBuilder} from './query_builder'
import { ModelOptions, SchemaType } from '../types/types';
import { ModelHooks } from './hooks';
import { ModelValidation } from './validation';
import { ModelIndexes } from './indexes';

export class BaseModel<T extends SchemaType> {
    protected collection: Collection;
    protected queryBuilder: QueryBuilder<T>;
    protected hooks: ModelHooks<T>;
    protected validation: ModelValidation<T>;
    protected indexes: ModelIndexes;
    


    constructor(
        public options: ModelOptions = {},

    ){}
}

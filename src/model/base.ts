import {Collection} from 'mongodb'
import {Schema} from '../schema'
import {QueryBuilder} from './query_builder'
import { ModelOptions, SchemaType } from '../types/types';
import { ModelHooks } from './hooks';
import { ModelValidation } from './validation';
import { ModelIndexes } from './indexes';
import { RelationManager } from '../relationships/manager';
import { BsonifyClient } from '../client';

export class BaseModel<T extends SchemaType> {
    protected collection: Collection;
    protected queryBuilder: QueryBuilder<T>;
    protected hooks: ModelHooks<T>;
    protected validation: ModelValidation<T>;
    protected indexes: ModelIndexes;
    protected relationManager: RelationManager;
    


    constructor(
        protected options: ModelOptions = {},
        protected schema: Schema<T>,
        protected client: BsonifyClient,
        protected name: string


    ){
        const collectionName = options.collection || name.toLowerCase();
        this.collection = client.getDatabase().collection(collectionName);
        this.queryBuilder = new QueryBuilder<T>(this.options);
        this.hooks = new ModelHooks<T>();
        this.validation = new ModelValidation<T>(this.schema);
        this.indexes = new ModelIndexes(this.collection);
        this.relationManager = new RelationManager(this);

        client.registerModel(name, this);
    }
}

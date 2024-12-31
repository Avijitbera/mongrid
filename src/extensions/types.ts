import {Model} from '../model/model'
import {Document, Filter, FindOptions, WithId} from 'mongodb'
import { SchemaType } from '../types/types';

export interface ExtensionContext<T extends SchemaType = SchemaType> {
    model: Model<T>;
    schema: any;
    collection: any;
    
}

export interface QueryHandlers<T extends Document = Document> {
    beforeFind?: <D extends T>(filter: Filter<D>, options?: FindOptions) => Promise<[Filter<D>, FindOptions?]>;
  afterFind?: <D extends T>(results: WithId<D>[]) => Promise<WithId<D>[]>;
  beforeCreate?: <D extends T>(data: Partial<D>) => Promise<Partial<D>>;
  afterCreate?: <D extends T>(result: WithId<D>) => Promise<WithId<D>>;
  beforeUpdate?: <D extends T>(filter: Filter<D>, update: Partial<D>) => Promise<[Filter<D>, Partial<D>]>;
  afterUpdate?: <D extends T>(result: WithId<D> | null) => Promise<WithId<D> | null>;
  beforeDelete?: <D extends T>(filter: Filter<D>) => Promise<Filter<D>>;
  afterDelete?: (success: boolean) => Promise<boolean>;
}

export interface ModelExtension<T extends Document = Document> {
    methods?: Record<string, (this: Model<any>, ...args:any[]) => any>;
    statics?: Record<string, (...args:any[]) => any>;
    queryHandlers?: QueryHandlers<T>;
    setup?: (context: ExtensionContext) => Promise<void>;
}
import {Model} from '../model/model'
import {Document, Filter, FindOptions} from 'mongodb'
import { SchemaType } from '../types/types';

export interface ExtensionContext<T extends SchemaType = SchemaType> {
    model: Model<T>;
    schema: any;
    collection: any;
    
}

export interface QueryExtension {
    beforeFind?: (filter: Filter<Document>, options?:FindOptions) => Promise<[Filter<Document>, FindOptions?]>;
    afterFind?: (result: Document[]) => Promise<Document[]>;
    beforeCreate?: (data:any) => Promise<any>;
    afterCreate?: (result: Document) => Promise<Document>;
    beforeUpdate?:(filter: Filter<Document>, update: any) => Promise<[Filter<Document>, any]>;
    afterUpdate?: (result: Document | null) => Promise<Document | null>;
  beforeDelete?: (filter: Filter<Document>) => Promise<Filter<Document>>;
  afterDelete?: (success: boolean) => Promise<boolean>;

}

export interface ModelExtension {
    methods?: Record<string, (this: Model<any>, ...args:any[]) => any>;
    statics?: Record<string, (...args:any[]) => any>;
    queryExtensions?: QueryExtension;
}
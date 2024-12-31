import {Model} from '../model/model'
import {Document, Filter, FindOptions} from 'mongodb'
import { SchemaType } from '../types/types';

export interface ExtensionContext<T extends SchemaType = SchemaType> {
    model: Model<T>;
    schema: any;
    collection: any;
    
}

export interface QueryExtension {}


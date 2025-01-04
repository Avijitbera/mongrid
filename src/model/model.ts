import {Collection, Document, Filter, FindOptions} from 'mongodb'
import { ModelOptions, SchemaType } from '../types/types';
import { RelationManager } from '../relationships/manager';
import { BsonifyClient } from '../client';
import { Schema } from '../schema';
import { ExtensionManager } from '../extensions/manager';
import {ModelOperations} from './operations'
import { ModelExtension } from '../extensions/types';
import { ModelDocument } from '../types/model';
import { ModelQueryOptions } from './types';

export class Model<T extends SchemaType> extends ModelOperations<T>{
    
    private readonly extensionManager: ExtensionManager;

    constructor(
         client: BsonifyClient,
         name: string,
         schema: Schema<T>,
         options: ModelOptions = {}
        
    ){
       super(client,options, schema, name);
       this.extensionManager = new ExtensionManager(this);
       client.registerModel(name, this);
    }

    extend(name:string, extensions: ModelExtension): void {
        this.extensionManager.register(name, extensions);
    }
    async findOne(
        filter: Filter<ModelDocument<T>>,
        options?: ModelQueryOptions
      ): Promise<ModelDocument<T> | null> {
        return super.findOne(filter, options);
      }
    
      async find(
        filter: Filter<ModelDocument<T>>,
        options?: ModelQueryOptions
      ): Promise<ModelDocument<T>[]> {
        return super.find(filter, options);
      }
    
}
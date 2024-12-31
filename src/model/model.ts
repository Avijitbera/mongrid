import {Collection, Document, Filter, FindOptions} from 'mongodb'
import { ModelOptions, SchemaType } from '../types/types';
import { RelationManager } from '../relationships/manager';
import { BsonifyClient } from '../client';
import { Schema } from '../schema';
import { ExtensionManager } from '../extensions/manager';

export class Model<T extends SchemaType> {
    private collection: Collection;
    private relationManager: RelationManager;
    private extensionManager: ExtensionManager;

    constructor(
        public client: BsonifyClient,
        private name: string,
        private schema: Schema<T>,
        private options: ModelOptions = {}
        
    ){
        const collectionName = options.collection || name.toLowerCase();
        this.collection = client.getDatabase().collection(collectionName);
        this.relationManager = new RelationManager(this);
        this.extensionManager = new ExtensionManager(this);
        client.registerModel(name, this);
    }

    
}
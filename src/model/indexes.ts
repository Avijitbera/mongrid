import {Collection, CreateIndexesOptions, IndexSpecification} from 'mongodb'
import { ModelIndexConfig } from '../types/model'

export class ModelIndexes {
    constructor(private collection: Collection){}

    async createIndex(spec: IndexSpecification, options?: CreateIndexesOptions): Promise<string> {
        return this.collection.createIndex(spec, options)
    }

    async createDefaultIndexes(): Promise<void> {
        await this.createIndex({_id:1})
    }

    async createCompoundIndex(config: ModelIndexConfig): Promise<string> {
        const {fields, ...options} = config
        return this.collection.createIndex(fields, options)
    }

    async dropIndex(indexName: string): Promise<void>{
        await this.collection.dropIndex(indexName)
    }

    async listIndexes(): Promise<IndexSpecification[]> {
        return this.collection.listIndexes().toArray();
    }
}
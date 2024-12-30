import {CreateIndexesOptions, Document, } from 'mongodb'
import {SchemaType} from './types'


export interface ModelIndexConfig extends CreateIndexesOptions {
    fields: Record<string, 1 | -1>
}

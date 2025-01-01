import {CreateIndexesOptions, Document, FindOptions, ObjectId, } from 'mongodb'
import {SchemaType} from './types'

export type RelationType = "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_ONE" | "MANY_TO_MANY"

export interface ModelRelationConfig {
    type: RelationType,
    ref: string;
    foreignField?: string;
    through?: string;
    localField?: string;
}

export interface ModelIndexConfig extends CreateIndexesOptions {
    fields: Record<string, 1 | -1>
}
export interface ModelQueryOptions extends FindOptions {
    populate?:string[];
}

export interface ModelDocument<T> extends Document {
    _id: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    [key: string]: unknown;
  }
import { FindOptions } from 'mongodb';
import {SchemaType, InferSchemaType} from '../types/types'

export interface QueryResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    count?: number;
}

export interface BsonifyQueryOptions {
    populate?: string[];
    lean?: boolean;
    
    requestTimeout?: number; // Renamed from timeout to avoid conflict
}

import {Document, ObjectId} from 'mongodb'

export interface BsonifyOptions {
    url: string
    database: string
}

export type SchemaType = {
    [key: string]:{
        type: any;
        required?: boolean;
        default?:any;
        unique?:boolean;
        ref?:string;
        validate?:(value: any) => boolean | Promise<boolean>
    }
}

export interface ModelOptions {
    timestamps?:boolean;
    collection?: string;
    softDelete?: boolean;
    defaultOptions?:{
        sort?: Record<string, 1 | -1>;
        limit?: number;
        skip?: number
    },
    description?:string
}


export type InferSchemaType<T extends SchemaType> = {
    [K in keyof T]: T[K]['type'] extends typeof String
    ? string
    : T[K]['type'] extends typeof Number
    ? number
    : T[K]['type'] extends typeof Boolean
    ? boolean
    : T[K]['type'] extends typeof Date
    ? Date
    : T[K]['type'] extends typeof ObjectId
    ? ObjectId
    : T[K]['type'] extends (infer U)[]
    ? U[]
    : T[K]['type'];
}
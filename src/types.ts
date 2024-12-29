import {Document} from 'mongodb'

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
}

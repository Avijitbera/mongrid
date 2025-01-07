import { RelationOptions } from "./relation_type";

export interface FieldOptions {
    name?: string;
    type?: FieldType;
    required?: boolean;
    unique?: boolean;
    default?: any;
    min?: number;
    max?: number;
    enum?: any[];
    cascade?: boolean;
    ref?: string;
    index?: boolean;
    relationOptions?: RelationOptions;
}

export enum FieldType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Date = 'date',
    ObjectId = 'objectId',
    Array = 'array',
    Mixed = 'mixed',
    Buffer = 'buffer',
    Object = 'object',
    Custom = 'custom'
}


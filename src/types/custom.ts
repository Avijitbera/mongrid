export interface CustomType<T = any> {
    name: string;
    serialize: (value: T) => any;
    deserialize: (value: any) => T;
    validate:(value:any) => boolean
}

export class CustomTypeRegistry {
    private static types: Map<string, CustomType> = new Map();
}


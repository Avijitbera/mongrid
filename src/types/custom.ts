export interface CustomType<T = any> {
    name: string;
    serialize: (value: T) => any;
    deserialize: (value: any) => T;
    validate:(value:any) => boolean
}

export class CustomTypeRegistry {
    private static types: Map<string, CustomType> = new Map();

    static register(type: CustomType) {
        if (this.types.has(type.name)) {
            throw new Error(`Type ${type.name} already registered`);
        }
        this.types.set(type.name, type);
    }
}


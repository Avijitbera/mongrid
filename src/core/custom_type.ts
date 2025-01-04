export interface CustomType<T = any> {
    /**
     * Convert the custom type to a MongoDB-compatible value.
     */
    serialize(value: T): any;

    /**
     * Convert a MongoDB value back to the custom type.
     */
    deserialize(value: any): T;
}
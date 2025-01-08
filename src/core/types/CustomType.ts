
export abstract class CustomType {
    abstract serialize(value: any): any;
    abstract deserialize(value: any): any;
}
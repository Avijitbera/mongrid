
export interface CustomType<T> {
     validate(value: T): void;
     trasform(value: T): T;
     toMongoSchema(): any;
}
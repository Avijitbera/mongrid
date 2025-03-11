import { CustomType } from "../types/CustomType";
import { Validator } from "../validators/Validator";
import { Field } from "./Field";


export class FieldBuilder<T> {
    private field: Field<T>;

    constructor(private name: string){
        this.field = new Field<T>(name);
    }

    unique(): this {
        this.field.unique();
        return this;
    }

    index(): this {
        this.field.index();
        return this;
    }

    required():this {
        this.field.required();
        return this;
    }

    type(type:any): this {
        this.field.type(type);
        return this;
    }

    // customType(customType: CustomType): this {
    //     this.field.customType(customType);
    //     return this;
    // }

    default(value: T | (() => T)): this {
        if (typeof value === 'function') {
            this.field.default((value as () => T)());
        } else {
            this.field.default(value);
        }
        return this;
    }

    addValidator(validator: Validator<T>): this {
        this.field.addValidator(validator);
        return this;
    }

    build(): Field<T> {
        return this.field;
    }
    
}
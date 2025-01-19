import { Hook } from "../hooks/Hook";
import { HookType } from "../hooks/HookType";
import { CustomType } from "../types/CustomType";
import { Validator } from "../validators/Validator";

export class Field<T> {
    private options: {
        unique?: boolean;
        index?: boolean;
        required?: boolean;
        type?:any;
        customType?:CustomType;
        validators?:Validator<T>[],
        default?:T,
        hooks?: {[key in HookType]?: Hook<T>[]},
        alias?:string,
        transform?: (value:T) => T,
        immutable?: boolean | ((value:T) => boolean)

    } = {};

    constructor(private name: string){}

    immutable(condition?: (document:T) => boolean): this {
        this.options.immutable = condition ? condition : true;
        return this;
    }

    required():this {
        this.options.required = true;
        return this;
    }

    unique():this {
        this.options.unique = true;
        return this;
    }

    index(): this {
        this.options.index = true;
        return this;
    }

    type(type: any): this {
        this.options.type = type;
        return this;
    }

    customType(customType: CustomType): this {
        this.options.customType = customType;
        return this;
    }

    default(value: T): this {
        this.options.default = value;
        return this;
    }

    addValidator(validator: Validator<T>): this {
        if(!this.options.validators){
            this.options.validators = [];
        }
        this.options.validators.push(validator);
        return this;
    }

    // addHook(hookType: HookType, hook: Hook<T>): this {
    //     if(!this.options.hooks){
    //         this.options.hooks = {};
    //     }
    //     if(!this.options.hooks[hookType]){
    //         this.options.hooks[hookType] = [];
    //     }
    //     this.options.hooks[hookType].push(hook);
    //     return this;
    // }

    alias(alias: string): this {
        this.options.alias = alias;
        return this;
    }

    transform(transform: (value:T) => T): this {
        this.options.transform = transform;
        return this;
    }

    getOptions(){
        return this.options
    }
    getName(){
        return this.name;
    }
}
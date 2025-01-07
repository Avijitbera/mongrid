import { FieldOptions, FieldType } from "../types/field_type";


export const Field = (options: Partial<FieldOptions> = {}) =>{
    return function (target: any, propertyKey: ClassFieldDecoratorContext){
        console.log({propertyKey:propertyKey})
        Reflect.defineMetadata('fieldOptions', options, propertyKey,)
    }
}
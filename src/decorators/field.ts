import 'reflect-metadata'
const FIELD_METADATA_KEY = 'field'
const REQUIRED_METADATA_KEY = 'required'
const DEFAULT_METADATA_KEY = 'default'
const INDEX_METADATA_KEY = 'index'
const IMMUTABLE_METADATA_KEY = 'immutable'
const UNIQUE_METADATA_KEY = 'unique'
const VALIDATION_METADATA_KEY = 'validation'
const TRANSFORM_METADATA_KEY = 'transform'
const DESCRIPTION_METADATA_KEY = 'describe'

/**
 * Decorator to define a field in a model.
 * @param options - Field options (e.g., required, default, index, etc.).
 */
export function Field(options:{
    required?:boolean;
    default?:any;
    index?:boolean;
    immutable?:boolean;
    unique?:boolean;
    validate?:{
        minLength?:number;
        maxLength?:number;
        regex?:RegExp;
        custom?:(value:any) => boolean;
    };
    transform?:(value:any) => any;
    description?:string
} = {}){
    return function(target: any, propertyKey:string){
        const type = Reflect.getMetadata('design:type', target, propertyKey)
        Reflect.defineMetadata(FIELD_METADATA_KEY, type, target, propertyKey)

        if(options.required){
            Reflect.defineMetadata(REQUIRED_METADATA_KEY, true, target, propertyKey)
        }
        if (options.default !== undefined) {
            Reflect.defineMetadata(DEFAULT_METADATA_KEY, options.default, target, propertyKey);
        }
        if (options.index) {
            Reflect.defineMetadata(INDEX_METADATA_KEY, true, target, propertyKey);
        }
        if (options.immutable) {
            Reflect.defineMetadata(IMMUTABLE_METADATA_KEY, true, target, propertyKey);
        }
        if (options.unique) {
            Reflect.defineMetadata(UNIQUE_METADATA_KEY, true, target, propertyKey);
        }
        if (options.validate) {
            Reflect.defineMetadata(VALIDATION_METADATA_KEY, options.validate, target, propertyKey);
        }
        if (options.transform) {
            Reflect.defineMetadata(TRANSFORM_METADATA_KEY, options.transform, target, propertyKey);
        }
        if (options.description) {
            Reflect.defineMetadata(DESCRIPTION_METADATA_KEY, options.description, target, propertyKey);
        }
    }
}

import { SchemaType } from './types/types'
import {CustomTypeRegistry} from '../src/types/custom'

export class Schema<T extends SchemaType>{
    constructor(private schema: T){}

    getSchema():T{
        return this.schema
    }

    validate(data:any):boolean {
        for(const [field, config] of Object.entries(this.schema)){
            //Required field validation
            if(config.required && data[field] === undefined || data[field] === null){
                throw new Error(`${field} is required`)
            }
            //Type validation
            if(data[field] !== undefined){
                const value = data[field]
                const type = config.type
                if(!this.validateType(value, type)){
                    throw new  Error(`${field} should be of type ${type}`)
                }
                //Custom validation
                if(config.validate && !config.validate(value)){
                    throw new Error(`${field} failed custom validation`)
                }
            }
        }
        return true;
    }

    private validateType(value:any, type:any): boolean{
        if(CustomTypeRegistry.isCustomType(type)){
            return type.validate(value)
        }

        if(Array.isArray(type)){
            return Array.isArray(value) && value.every((item) => this.validateType(item, type[0]))
        }

        switch(type){
            case String:
                return typeof value === 'string';
            case Number:
                return typeof value === 'number';
            case Boolean:
                return typeof value === 'boolean';
            case Date:
                return value instanceof Date;
            default:
                return true
        }
    }

    serialize(data:any):any{
        const serializd: any = {}
        for (const [field, value] of Object.entries(data)) {
            if (value === undefined) continue

            const config = this.schema[field]
            if(!config){
                serializd[field] = value
                continue;
            }
            const type = config.type;
            if(CustomTypeRegistry.isCustomType(type)){
                serializd[field] = type.serialize(value)
            }else{
                serializd[field] = value
            }
            }
            return serializd
    }

    deserialize(data:any):any{
        const deserialized: any = {}
        for (const [field, value] of Object.entries(data)) {
            if (value === undefined) continue
            const config = this.schema[field]
            if(!config){
                deserialized[field] = value;
                continue;
            }
            const type = config.type;
            if(CustomTypeRegistry.isCustomType(type)){
                deserialized[field] = type.deserialize(value)
            }else{
                deserialized[field] = value
            }
        }
        return deserialized
    }
}

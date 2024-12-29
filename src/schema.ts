import { SchemaType } from './types/types'
// import {} from '../src/'

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
        return true
    }
}

import {Schema} from '../schema'
import {SchemaType} from '../types/types'


export class ModelValidation<T extends SchemaType> {
    constructor(private schema: Schema<T>){}

    async validate(data: any): Promise<boolean> {
        this.schema.validate(data);
    
        return true;
    }
}
